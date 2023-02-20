var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EnForm, DonationAmount, EngridLogger, ProcessingFees } from "./";
/*global window */
const ApplePaySession = window.ApplePaySession;
const merchantIdentifier = window.merchantIdentifier;
const merchantDomainName = window.merchantDomainName;
const merchantDisplayName = window.merchantDisplayName;
const merchantSessionIdentifier = window.merchantSessionIdentifier;
const merchantNonce = window.merchantNonce;
const merchantEpochTimestamp = window.merchantEpochTimestamp;
const merchantSignature = window.merchantSignature;
const merchantCountryCode = window.merchantCountryCode;
const merchantCurrencyCode = window.merchantCurrencyCode;
const merchantSupportedNetworks = window.merchantSupportedNetworks;
const merchantCapabilities = window.merchantCapabilities;
const merchantTotalLabel = window.merchantTotalLabel;
export class ApplePay {
    constructor() {
        this.applePay = document.querySelector('.en__field__input.en__field__input--radio[value="applepay"]');
        this._amount = DonationAmount.getInstance();
        this._fees = ProcessingFees.getInstance();
        this._form = EnForm.getInstance();
        this.logger = new EngridLogger("Apple Pay");
        this.checkApplePay();
    }
    checkApplePay() {
        return __awaiter(this, void 0, void 0, function* () {
            const pageform = document.querySelector("form.en__component--page");
            if (!this.applePay || !window.hasOwnProperty("ApplePaySession")) {
                const applePayContainer = document.querySelector(".en__field__item.applepay");
                if (applePayContainer)
                    applePayContainer.remove();
                this.logger.log("Apple Pay DISABLED");
                return false;
            }
            const promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
            let applePayEnabled = false;
            yield promise.then((canMakePayments) => {
                applePayEnabled = canMakePayments;
                if (canMakePayments) {
                    let input = document.createElement("input");
                    input.setAttribute("type", "hidden");
                    input.setAttribute("name", "PkPaymentToken");
                    input.setAttribute("id", "applePayToken");
                    pageform.appendChild(input);
                    this._form.onSubmit.subscribe(() => this.onPayClicked());
                }
            });
            this.logger.log("applePayEnabled", applePayEnabled);
            let applePayWrapper = this.applePay.closest(".en__field__item");
            if (applePayEnabled) {
                // Set Apple Pay Class
                applePayWrapper === null || applePayWrapper === void 0 ? void 0 : applePayWrapper.classList.add("applePayWrapper");
            }
            else {
                // Hide Apple Pay Wrapper
                if (applePayWrapper)
                    applePayWrapper.style.display = "none";
            }
            return applePayEnabled;
        });
    }
    performValidation(url) {
        const logger = this.logger;
        return new Promise(function (resolve, reject) {
            var merchantSession = {};
            merchantSession.merchantIdentifier = merchantIdentifier;
            merchantSession.merchantSessionIdentifier = merchantSessionIdentifier;
            merchantSession.nonce = merchantNonce;
            merchantSession.domainName = merchantDomainName;
            merchantSession.epochTimestamp = merchantEpochTimestamp;
            merchantSession.signature = merchantSignature;
            var validationData = "&merchantIdentifier=" +
                merchantIdentifier +
                "&merchantDomain=" +
                merchantDomainName +
                "&displayName=" +
                merchantDisplayName;
            var validationUrl = "/ea-dataservice/rest/applepay/validateurl?url=" + url + validationData;
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                var data = JSON.parse(this.responseText);
                logger.log("Apple Pay Validation", data);
                resolve(data);
            };
            xhr.onerror = reject;
            xhr.open("GET", validationUrl);
            xhr.send();
        });
    }
    log(name, msg) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/ea-dataservice/rest/applepay/log?name=" + name + "&msg=" + msg);
        xhr.send();
    }
    sendPaymentToken(token) {
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    }
    onPayClicked() {
        const logger = this.logger;
        const enFieldPaymentType = document.querySelector("#en__field_transaction_paymenttype");
        const applePayToken = document.getElementById("applePayToken");
        const formClass = this._form;
        // Only work if Payment Type is Apple Pay
        if (enFieldPaymentType.value == "applepay" && applePayToken.value == "") {
            try {
                let donationAmount = this._amount.amount + this._fees.fee;
                var request = {
                    supportedNetworks: merchantSupportedNetworks,
                    merchantCapabilities: merchantCapabilities,
                    countryCode: merchantCountryCode,
                    currencyCode: merchantCurrencyCode,
                    total: {
                        label: merchantTotalLabel,
                        amount: donationAmount,
                    },
                };
                var session = new ApplePaySession(1, request);
                var thisClass = this;
                session.onvalidatemerchant = function (event) {
                    thisClass
                        .performValidation(event.validationURL)
                        .then(function (merchantSession) {
                        logger.log("Apple Pay merchantSession", merchantSession);
                        session.completeMerchantValidation(merchantSession);
                    });
                };
                session.onpaymentauthorized = function (event) {
                    thisClass
                        .sendPaymentToken(event.payment.token)
                        .then(function (success) {
                        logger.log("Apple Pay Token", event.payment.token);
                        document.getElementById("applePayToken").value = JSON.stringify(event.payment.token);
                        formClass.submitForm();
                    });
                };
                session.oncancel = function (event) {
                    this.logger.log("Cancelled", event);
                    alert("You cancelled. Sorry it didn't work out.");
                    formClass.dispatchError();
                };
                session.begin();
                this._form.submit = false;
                return false;
            }
            catch (e) {
                alert("Developer mistake: '" + e.message + "'");
                formClass.dispatchError();
            }
        }
        this._form.submit = true;
        return true;
    }
}
