import { SimpleEventDispatcher } from "strongly-typed-events";
import { EnForm } from "./en-form";
import { DonationAmount } from "./donation-amount";
export class ProcessingFees {
  private _onFeeChange = new SimpleEventDispatcher<number>();
  public _amount: DonationAmount = DonationAmount.getInstance();
  public _form: EnForm = EnForm.getInstance();
  private _fee: number = 0;
  private _field: HTMLInputElement | null = null;

  private _subscribe?: () => void;

  private static instance: ProcessingFees;

  constructor() {
    // Run only if it is a Donation Page with a Donation Amount field
    if (!document.getElementsByName("transaction.donationAmt").length) {
      return;
    }
    this._field = this.isENfeeCover()
      ? document.querySelector("#en__field_transaction_feeCover")
      : document.querySelector('input[name="supporter.processing_fees"]');
    // Watch the Radios for Changes
    if (this._field instanceof HTMLInputElement) {
      this._field.addEventListener("change", (e: Event) => {
        if (
          this._field instanceof HTMLInputElement &&
          this._field.checked &&
          !this._subscribe
        ) {
          this._subscribe = this._form.onSubmit.subscribe(() => this.addFees());
        }
        this._onFeeChange.dispatch(this.fee);
      });
    }

    // this._amount = amount;
  }
  public static getInstance(): ProcessingFees {
    if (!ProcessingFees.instance) {
      ProcessingFees.instance = new ProcessingFees();
    }

    return ProcessingFees.instance;
  }
  public get onFeeChange() {
    return this._onFeeChange.asEvent();
  }
  get fee(): number {
    return this.calculateFees();
  }

  // Every time we set a frequency, trigger the onFrequencyChange event
  set fee(value: number) {
    this._fee = value;
    this._onFeeChange.dispatch(this._fee);
  }

  public calculateFees(amount: number = 0) {
    if (this._field instanceof HTMLInputElement && this._field.checked) {
      if (this.isENfeeCover()) {
        return amount > 0
          ? window.EngagingNetworks.require._defined.enjs.feeCover.fee(amount)
          : window.EngagingNetworks.require._defined.enjs.getDonationFee();
      }
      const fees = {
        ...{
          processingfeepercentadded: "0",
          processingfeefixedamountadded: "0",
        },
        ...this._field?.dataset,
      };
      const amountToFee = amount > 0 ? amount : this._amount.amount;
      const processing_fee =
        (parseFloat(fees.processingfeepercentadded) / 100) * amountToFee +
        parseFloat(fees.processingfeefixedamountadded);
      return Math.round(processing_fee * 100) / 100;
    }
    return 0;
  }

  // Add Fees to Amount
  private addFees() {
    if (this._form.submit && !this.isENfeeCover()) {
      this._amount.setAmount(this._amount.amount + this.fee, false);
    }
  }
  // Remove Fees From Amount
  private removeFees() {
    if (!this.isENfeeCover())
      this._amount.setAmount(this._amount.amount - this.fee);
  }
  // Check if this is a Processing Fee from EN
  private isENfeeCover() {
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
