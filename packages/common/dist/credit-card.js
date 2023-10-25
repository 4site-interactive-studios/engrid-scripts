// This class provides the credit card handler
// and common credit card manipulation, like removing any non-numeric
//  characters from the credit card field
import { ENGrid, EnForm, EngridLogger } from "./";
import * as EngridCard from "./third-party/card-validator";
export class CreditCard {
    constructor() {
        this.logger = new EngridLogger("CreditCard", "#ccc84a", "#333", "💳");
        this._form = EnForm.getInstance();
        this.ccField = ENGrid.getField("transaction.ccnumber");
        this.ccValues = {
            "american-express": [
                "amex",
                "american express",
                "americanexpress",
                "american-express",
                "amx",
                "ax",
            ],
            visa: ["visa", "vi"],
            mastercard: ["mastercard", "master card", "mc"],
            discover: ["discover", "di"],
            "diners-club": ["diners", "diners club", "dinersclub", "dc"],
            jcb: ["jcb"],
            unionpay: ["unionpay", "union pay", "up"],
            maestro: ["maestro"],
            elo: ["elo"],
            mir: ["mir"],
            hiper: ["hiper", "hipercard"],
        };
        this.isPotentiallyValid = false;
        this.isValid = false;
        this.field_expiration_month = null;
        this.field_expiration_year = null;
        this.paymentTypeField = ENGrid.getField("transaction.paymenttype");
        this.handleExpUpdate = (e) => {
            if (!this.field_expiration_month || !this.field_expiration_year)
                return;
            const current_date = new Date();
            const current_month = current_date.getMonth() + 1;
            const current_year = parseInt(this.field_expiration_year[this.field_expiration_year.length - 1].value) > 2000
                ? current_date.getFullYear()
                : current_date.getFullYear() - 2000;
            // handle if year is changed to current year (disable all months less than current month)
            // handle if month is changed to less than current month (disable current year)
            if (e == "month") {
                let selected_month = parseInt(this.field_expiration_month.value);
                let disable = selected_month < current_month;
                this.logger.log(`month disable ${disable}`);
                this.logger.log(`selected_month ${selected_month}`);
                for (let i = 0; i < this.field_expiration_year.options.length; i++) {
                    // disable or enable current year
                    if (parseInt(this.field_expiration_year.options[i].value) <= current_year) {
                        if (disable) {
                            this.field_expiration_year.options[i].setAttribute("disabled", "disabled");
                        }
                        else {
                            this.field_expiration_year.options[i].disabled = false;
                        }
                    }
                }
            }
            else if (e == "year") {
                let selected_year = parseInt(this.field_expiration_year.value);
                let disable = selected_year == current_year;
                this.logger.log(`year disable ${disable}`);
                this.logger.log(`selected_year ${selected_year}`);
                for (let i = 0; i < this.field_expiration_month.options.length; i++) {
                    // disable or enable all months less than current month
                    if (parseInt(this.field_expiration_month.options[i].value) < current_month) {
                        if (disable) {
                            this.field_expiration_month.options[i].setAttribute("disabled", "disabled");
                        }
                        else {
                            this.field_expiration_month.options[i].disabled = false;
                        }
                    }
                }
            }
        };
        if (!this.ccField)
            return;
        const expireFiels = document.getElementsByName("transaction.ccexpire");
        if (expireFiels) {
            this.field_expiration_month = expireFiels[0];
            this.field_expiration_year = expireFiels[1];
        }
        this._form.onSubmit.subscribe(() => this.onlyNumbersCC());
        this._form.onValidate.subscribe(() => {
            if (this._form.validate) {
                if (ENGrid.debug)
                    console.log("Engrid Credit Cards: onValidate");
                this._form.validate = this.validate();
            }
        });
        this.addEventListeners();
        this.handleCCUpdate();
    }
    addEventListeners() {
        // Add event listeners to the credit card field
        ["keyup", "paste"].forEach((event) => {
            this.ccField.addEventListener(event, () => this.handleCCUpdate());
        });
        // Add event listeners to the expiration fields
        if (this.field_expiration_month && this.field_expiration_year) {
            ["change"].forEach((event) => {
                var _a, _b;
                (_a = this.field_expiration_month) === null || _a === void 0 ? void 0 : _a.addEventListener(event, () => {
                    this.handleExpUpdate("month");
                });
                (_b = this.field_expiration_year) === null || _b === void 0 ? void 0 : _b.addEventListener(event, () => {
                    this.handleExpUpdate("year");
                });
            });
        }
        // Add event listeners to the Give By Select Radio Buttons, if they exist
        const transactionGiveBySelect = document.getElementsByName("transaction.giveBySelect");
        if (transactionGiveBySelect) {
            transactionGiveBySelect.forEach((giveBySelect) => {
                giveBySelect.addEventListener("change", () => {
                    if (giveBySelect.value.toLowerCase() === "card") {
                        this.logger.log("Handle credit card auto-update");
                        window.setTimeout(() => {
                            this.handleCCUpdate();
                        }, 100);
                    }
                });
            });
        }
    }
    onlyNumbersCC() {
        const onlyNumbers = this.ccField.value.replace(/\D/g, "");
        this.ccField.value = onlyNumbers;
        return true;
    }
    handleCCUpdate() {
        var _a, _b;
        const cardContainer = this.ccField.closest(".en__field--ccnumber") ||
            document.querySelector(".en__field--ccnumber");
        if (!cardContainer) {
            this.logger.log("Card Container Not Found");
            return;
        }
        ENGrid.removeError(cardContainer);
        if (this.ccField.value.length < 2) {
            this.removeLiveCardTypeClasses();
            this.clearPaymentTypeField();
            return;
        }
        // const card_type = this.getCardType(this.ccField.value);
        const card_validation = EngridCard.number(this.ccField.value);
        const card_type = (_a = card_validation.card) === null || _a === void 0 ? void 0 : _a.type;
        const card_type_name = (_b = card_validation.card) === null || _b === void 0 ? void 0 : _b.niceType;
        this.isPotentiallyValid = card_validation.isPotentiallyValid || false;
        this.isValid = card_validation.isValid || false;
        console.log(EngridCard.number(this.ccField.value));
        this.removeLiveCardTypeClasses();
        if (!this.isPotentiallyValid) {
            ENGrid.setError(cardContainer, "Invalid Credit Card Number");
            this.addLiveCardTypeClasses("invalid");
            return;
        }
        if (!card_type) {
            // The card is potentially valid, but we don't know what type it is
            this.removeLiveCardTypeClasses();
            this.clearPaymentTypeField();
            return;
        }
        const selected_card_value = this.getCardTypeFromPaymentTypeField(card_type);
        if (!selected_card_value) {
            ENGrid.setError(cardContainer, `Unsupported Credit Card Type: ${card_type_name}`);
            this.addLiveCardTypeClasses("invalid");
            return;
        }
        this.addLiveCardTypeClasses(card_type);
        this.ccField.value = this.formatCCNumber(card_validation.card);
        if (this.paymentTypeField.value != selected_card_value) {
            this.logger.log(`card type ${card_type}`);
            this.paymentTypeField.value = selected_card_value || "";
            const paymentTypeChangeEvent = new Event("change", { bubbles: true });
            this.paymentTypeField.dispatchEvent(paymentTypeChangeEvent);
        }
    }
    formatCCNumber(card) {
        const cc_number = this.ccField.value;
        const clean_cc_number = cc_number.replace(/\D/g, "");
        const gaps = card.gaps;
        let formatted_cc_number = "";
        for (let i = 0; i < clean_cc_number.length; i++) {
            if (gaps.includes(i)) {
                formatted_cc_number += " ";
            }
            formatted_cc_number += clean_cc_number[i];
        }
        return formatted_cc_number;
    }
    removeLiveCardTypeClasses() {
        const prefix = "live-card-type-";
        const field_credit_card_classes = this.ccField.className
            .split(" ")
            .filter((c) => !c.startsWith(prefix));
        this.ccField.className = field_credit_card_classes.join(" ").trim();
    }
    addLiveCardTypeClasses(class_name) {
        this.ccField.classList.add(`live-card-type-${class_name}`);
        if (class_name == "invalid") {
            this.clearPaymentTypeField();
        }
    }
    clearPaymentTypeField() {
        this.paymentTypeField.value = "";
        const paymentTypeChangeEvent = new Event("change", { bubbles: true });
        this.paymentTypeField.dispatchEvent(paymentTypeChangeEvent);
    }
    isCardSupported(card_type) {
        // Return true if the this.paymentTypeField.options contains a value that matches the
        // card_type key on the ccValues object, otherwise return false
        return (card_type in this.ccValues &&
            Array.from(this.paymentTypeField.options).filter((d) => this.ccValues[card_type].includes(d.value.toLowerCase())).length > 0);
    }
    getCardTypeFromPaymentTypeField(card_type) {
        // Return the value of the this.paymentTypeField.options that matches the
        // card_type key on the ccValues object, otherwise return false
        return this.isCardSupported(card_type)
            ? Array.from(this.paymentTypeField.options).filter((d) => this.ccValues[card_type].includes(d.value.toLowerCase()))[0].value || false
            : false;
    }
    validate() {
        if (!this.isValid) {
            const cardContainer = this.ccField.closest(".en__field--ccnumber") ||
                document.querySelector(".en__field--ccnumber");
            if (cardContainer) {
                window.setTimeout(() => {
                    ENGrid.setError(cardContainer, "Invalid Credit Card Number");
                    this.ccField.focus();
                }, 100);
            }
            return false;
        }
        return true;
    }
}
