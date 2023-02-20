import { SimpleEventDispatcher } from "strongly-typed-events";
import { EnForm } from "./en-form";
import { DonationAmount } from "./donation-amount";
export class ProcessingFees {
    constructor() {
        this._onFeeChange = new SimpleEventDispatcher();
        this._amount = DonationAmount.getInstance();
        this._form = EnForm.getInstance();
        this._fee = 0;
        this._field = null;
        // Run only if it is a Donation Page with a Donation Amount field
        if (!document.getElementsByName("transaction.donationAmt").length) {
            return;
        }
        this._field = this.isENfeeCover()
            ? document.querySelector("#en__field_transaction_feeCover")
            : document.querySelector('input[name="supporter.processing_fees"]');
        // Watch the Radios for Changes
        if (this._field instanceof HTMLInputElement) {
            this._field.addEventListener("change", (e) => {
                if (this._field instanceof HTMLInputElement &&
                    this._field.checked &&
                    !this._subscribe) {
                    this._subscribe = this._form.onSubmit.subscribe(() => this.addFees());
                }
                this._onFeeChange.dispatch(this.fee);
            });
        }
        // this._amount = amount;
    }
    static getInstance() {
        if (!ProcessingFees.instance) {
            ProcessingFees.instance = new ProcessingFees();
        }
        return ProcessingFees.instance;
    }
    get onFeeChange() {
        return this._onFeeChange.asEvent();
    }
    get fee() {
        return this.calculateFees();
    }
    // Every time we set a frequency, trigger the onFrequencyChange event
    set fee(value) {
        this._fee = value;
        this._onFeeChange.dispatch(this._fee);
    }
    calculateFees(amount = 0) {
        var _a;
        if (this._field instanceof HTMLInputElement && this._field.checked) {
            if (this.isENfeeCover()) {
                return amount > 0
                    ? window.EngagingNetworks.require._defined.enjs.feeCover.fee(amount)
                    : window.EngagingNetworks.require._defined.enjs.getDonationFee();
            }
            const fees = Object.assign({
                processingfeepercentadded: "0",
                processingfeefixedamountadded: "0",
            }, (_a = this._field) === null || _a === void 0 ? void 0 : _a.dataset);
            const amountToFee = amount > 0 ? amount : this._amount.amount;
            const processing_fee = (parseFloat(fees.processingfeepercentadded) / 100) * amountToFee +
                parseFloat(fees.processingfeefixedamountadded);
            return Math.round(processing_fee * 100) / 100;
        }
        return 0;
    }
    // Add Fees to Amount
    addFees() {
        if (this._form.submit && !this.isENfeeCover()) {
            this._amount.setAmount(this._amount.amount + this.fee, false);
        }
    }
    // Remove Fees From Amount
    removeFees() {
        if (!this.isENfeeCover())
            this._amount.setAmount(this._amount.amount - this.fee);
    }
    // Check if this is a Processing Fee from EN
    isENfeeCover() {
        if ("feeCover" in window.EngagingNetworks) {
            for (const key in window.EngagingNetworks.feeCover) {
                if (window.EngagingNetworks.feeCover.hasOwnProperty(key)) {
                    return true;
                }
            }
        }
        return false;
    }
}
