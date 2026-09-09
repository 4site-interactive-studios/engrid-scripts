import { SimpleEventDispatcher } from "strongly-typed-events";
import { ENGrid } from "..";
export class DonationAmount {
    constructor(radios = "transaction.donationAmt", other = "transaction.donationAmt.other") {
        this._onAmountChange = new SimpleEventDispatcher();
        this._amount = 0;
        this._radios = "";
        this._other = "";
        this._dispatch = true;
        this._other = other;
        this._radios = radios;
        // Watch Radios Inputs for Changes
        document.addEventListener("change", (e) => {
            const element = e.target;
            if (element) {
                if (element.name == radios) {
                    this.amount = parseFloat(element.value);
                }
                else if (element.name == other) {
                    this.syncOtherAmount(element, true);
                }
            }
        });
        // Watch Other Amount Field
        const otherField = document.querySelector(`[name='${this._other}']`);
        if (otherField) {
            otherField.addEventListener("keyup", (e) => {
                this.syncOtherAmount(otherField);
            });
        }
        // Load the current amount
        this.load();
    }
    // EN may render the "other" radio with a non-numeric or non-positive value
    isOtherAmountSelected() {
        const selectedAmount = document.querySelector(`input[name="${this._radios}"]:checked`);
        if (!selectedAmount) {
            return false;
        }
        const amount = Number(selectedAmount.value);
        return !Number.isFinite(amount) || amount <= 0;
    }
    syncOtherAmount(field, formatValue = false) {
        const otherIsSelected = this.isOtherAmountSelected();
        const amount = ENGrid.cleanAmount(field.value);
        if (!otherIsSelected || amount <= 0) {
            return;
        }
        if (formatValue) {
            field.value = amount % 1 != 0 ? amount.toFixed(2) : amount.toString();
        }
        this.amount = amount;
    }
    static getInstance(radios = "transaction.donationAmt", other = "transaction.donationAmt.other") {
        if (!DonationAmount.instance) {
            DonationAmount.instance = new DonationAmount(radios, other);
        }
        return DonationAmount.instance;
    }
    get amount() {
        return this._amount;
    }
    // Every time we set an amount, trigger the onAmountChange event
    set amount(value) {
        this._amount = value || 0;
        if (this._dispatch)
            this._onAmountChange.dispatch(this._amount);
    }
    get onAmountChange() {
        return this._onAmountChange.asEvent();
    }
    // Set amount var with currently selected amount
    load() {
        const currentAmountField = document.querySelector('input[name="' + this._radios + '"]:checked');
        if (currentAmountField) {
            let currentAmountValue = parseFloat(currentAmountField.value || "");
            if (currentAmountValue > 0) {
                this.amount = parseFloat(currentAmountField.value);
            }
            else {
                const otherField = document.querySelector('input[name="' + this._other + '"]');
                currentAmountValue = ENGrid.cleanAmount(otherField.value);
                this.amount = currentAmountValue;
            }
        }
        else if (ENGrid.checkNested(window.EngagingNetworks, "require", "_defined", "enjs", "getDonationTotal") &&
            ENGrid.checkNested(window.EngagingNetworks, "require", "_defined", "enjs", "getDonationFee")) {
            const total = window.EngagingNetworks.require._defined.enjs.getDonationTotal() -
                window.EngagingNetworks.require._defined.enjs.getDonationFee();
            if (total) {
                this.amount = total;
            }
        }
    }
    // Force a new amount
    setAmount(amount, dispatch = true) {
        // Run only if it is a Donation Page with a Donation Amount field
        if (!document.getElementsByName(this._radios).length) {
            return;
        }
        // Set dispatch to be checked by the SET method
        this._dispatch = dispatch;
        // Search for the current amount on radio boxes
        let found = Array.from(document.querySelectorAll('input[name="' + this._radios + '"]')).filter((el) => el instanceof HTMLInputElement && parseInt(el.value) == amount);
        // We found the amount on the radio boxes, so check it
        if (found.length) {
            const amountField = found[0];
            amountField.checked = true;
            // Change Event
            const event = new Event("change", {
                bubbles: true,
                cancelable: true,
            });
            amountField.dispatchEvent(event);
            // Clear OTHER text field
            this.clearOther();
        }
        else {
            const otherField = document.querySelector('input[name="' + this._other + '"]');
            if (otherField) {
                const enFieldOtherAmountRadio = document.querySelector(`.en__field--donationAmt.en__field--withOther .en__field__item:nth-last-child(2) input[name="${this._radios}"]`);
                if (enFieldOtherAmountRadio) {
                    enFieldOtherAmountRadio.checked = true;
                }
                otherField.value = parseFloat(amount.toString()).toFixed(2);
                // Change Event
                const event = new Event("change", {
                    bubbles: true,
                    cancelable: true,
                });
                otherField.dispatchEvent(event);
                const otherWrapper = otherField.parentNode;
                otherWrapper.classList.remove("en__field__item--hidden");
            }
        }
        // Set the new amount and trigger all live variables
        this.amount = amount;
        // Revert dispatch to default value (true)
        this._dispatch = true;
    }
    // Clear Other Field
    clearOther() {
        const otherField = document.querySelector('input[name="' + this._other + '"]');
        otherField.value = "";
        const otherWrapper = otherField.parentNode;
        otherWrapper.classList.add("en__field__item--hidden");
    }
}
