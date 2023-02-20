import {
  DonationAmount,
  EnForm,
  DonationFrequency,
  ProcessingFees,
} from "./events";
import { ENGrid, EngridLogger, Options, OptionsDefaults } from "./";
export class LiveVariables {
  public _amount: DonationAmount = DonationAmount.getInstance();
  public _fees: ProcessingFees = ProcessingFees.getInstance();
  private _frequency: DonationFrequency = DonationFrequency.getInstance();
  private _form: EnForm = EnForm.getInstance();
  private multiplier: number = 1 / 12;
  private submitLabel;
  private options: Options;

  private logger: EngridLogger = new EngridLogger("Live Variables");

  constructor(options: Options) {
    this.options = { ...OptionsDefaults, ...options };
    this.submitLabel =
      document.querySelector<HTMLButtonElement>(".en__submit button")
        ?.innerHTML || "Donate";
    this._amount.onAmountChange.subscribe(() => this.changeSubmitButton());
    this._amount.onAmountChange.subscribe(() => this.changeLiveAmount());
    this._amount.onAmountChange.subscribe(() => this.changeLiveUpsellAmount());
    this._fees.onFeeChange.subscribe(() => this.changeLiveAmount());
    this._fees.onFeeChange.subscribe(() => this.changeLiveUpsellAmount());
    this._fees.onFeeChange.subscribe(() => this.changeSubmitButton());

    this._frequency.onFrequencyChange.subscribe(() => this.swapAmounts());
    this._frequency.onFrequencyChange.subscribe(() =>
      this.changeLiveFrequency()
    );
    this._frequency.onFrequencyChange.subscribe(() => this.changeRecurrency());
    this._frequency.onFrequencyChange.subscribe(() =>
      this.changeSubmitButton()
    );

    this._form.onSubmit.subscribe(() => this.loadingSubmitButton());
    this._form.onError.subscribe(() => this.changeSubmitButton());

    // Watch the monthly-upsell links
    document.addEventListener("click", (e: Event) => {
      const element = e.target as HTMLInputElement;
      if (element) {
        if (element.classList.contains("monthly-upsell")) {
          this.upsold(e);
        } else if (element.classList.contains("form-submit")) {
          e.preventDefault();
          this._form.submitForm();
        }
      }
    });
  }

  private getAmountTxt(amount: number = 0) {
    const symbol = ENGrid.getCurrencySymbol() ?? "$";
    const dec_separator = this.options.DecimalSeparator ?? ".";
    const thousands_separator = this.options.ThousandsSeparator ?? "";
    const dec_places = amount % 1 == 0 ? 0 : this.options.DecimalPlaces ?? 2;
    const amountTxt = ENGrid.formatNumber(
      amount,
      dec_places,
      dec_separator,
      thousands_separator
    );
    return amount > 0 ? <string>symbol + amountTxt : "";
  }

  private getUpsellAmountTxt(amount: number = 0) {
    const symbol = ENGrid.getCurrencySymbol() ?? "$";
    const dec_separator = this.options.DecimalSeparator ?? ".";
    const thousands_separator = this.options.ThousandsSeparator ?? "";
    const dec_places = amount % 1 == 0 ? 0 : this.options.DecimalPlaces ?? 2;
    const amountTxt = ENGrid.formatNumber(
      Math.ceil(amount / 5) * 5,
      dec_places,
      dec_separator,
      thousands_separator
    );
    return amount > 0 ? <string>symbol + amountTxt : "";
  }

  private getUpsellAmountRaw(amount: number = 0) {
    const amountRaw = Math.ceil(amount / 5) * 5;
    return amount > 0 ? amountRaw.toString() : "";
  }

  public changeSubmitButton() {
    const submit = document.querySelector(
      ".en__submit button"
    ) as HTMLButtonElement;
    const amount = this.getAmountTxt(this._amount.amount + this._fees.fee);
    const frequency =
      this._frequency.frequency == "onetime"
        ? ""
        : this._frequency.frequency == "annual"
        ? "annually"
        : this._frequency.frequency;
    let label = this.submitLabel;

    if (amount) {
      label = label.replace("$AMOUNT", amount);
      label = label.replace("$FREQUENCY", frequency);
    } else {
      label = label.replace("$AMOUNT", "");
      label = label.replace("$FREQUENCY", "");
    }

    if (submit && label) {
      submit.innerHTML = label;
    }
  }
  public loadingSubmitButton() {
    const submit = document.querySelector(
      ".en__submit button"
    ) as HTMLButtonElement;
    // Don't add the Loading element if the button is from an Ajax form (like the supporter hub)
    if (submit.closest(".en__hubOverlay") !== null) {
      return true;
    }
    let submitButtonOriginalHTML = submit.innerHTML;
    let submitButtonProcessingHTML =
      "<span class='loader-wrapper'><span class='loader loader-quart'></span><span class='submit-button-text-wrapper'>" +
      submitButtonOriginalHTML +
      "</span></span>";
    submitButtonOriginalHTML = submit.innerHTML;
    submit.innerHTML = submitButtonProcessingHTML;
    return true;
  }

  public changeLiveAmount() {
    const value = this._amount.amount + this._fees.fee;
    const live_amount = document.querySelectorAll(".live-giving-amount");
    live_amount.forEach((elem) => (elem.innerHTML = this.getAmountTxt(value)));
  }

  public changeLiveUpsellAmount() {
    const value = (this._amount.amount + this._fees.fee) * this.multiplier;
    const live_upsell_amount = document.querySelectorAll(
      ".live-giving-upsell-amount"
    );

    live_upsell_amount.forEach(
      (elem) => (elem.innerHTML = this.getUpsellAmountTxt(value))
    );

    const live_upsell_amount_raw = document.querySelectorAll(
      ".live-giving-upsell-amount-raw"
    );
    live_upsell_amount_raw.forEach(
      (elem) => (elem.innerHTML = this.getUpsellAmountRaw(value))
    );
  }

  public changeLiveFrequency() {
    const live_frequency = document.querySelectorAll(".live-giving-frequency");
    live_frequency.forEach(
      (elem) =>
        (elem.innerHTML =
          this._frequency.frequency == "onetime"
            ? ""
            : this._frequency.frequency)
    );
  }

  public changeRecurrency() {
    const recurrpay = document.querySelector(
      "[name='transaction.recurrpay']"
    ) as HTMLInputElement;
    if (recurrpay && recurrpay.type != "radio") {
      recurrpay.value = this._frequency.frequency == "onetime" ? "N" : "Y";
      this._frequency.recurring = recurrpay.value;
      this.logger.log(
        "The Recurring Payment field [name='transaction.recurrpay'] has changed"
      );
      // Trigger the onChange event for the field
      const event = new Event("change", { bubbles: true });
      recurrpay.dispatchEvent(event);
    }
  }
  public swapAmounts() {
    if (
      "EngridAmounts" in window &&
      this._frequency.frequency in window.EngridAmounts
    ) {
      const loadEnAmounts = (amountArray: {
        amounts: [string, number];
        default: number;
      }) => {
        let ret = [];
        for (let amount in amountArray.amounts) {
          ret.push({
            selected: amountArray.amounts[amount] === amountArray.default,
            label: amount,
            value: amountArray.amounts[amount].toString(),
          });
        }
        return ret;
      };
      window.EngagingNetworks.require._defined.enjs.swapList(
        "donationAmt",
        loadEnAmounts(window.EngridAmounts[this._frequency.frequency]),
        {
          ignoreCurrentValue:
            !window.EngagingNetworks.require._defined.enjs.checkSubmissionFailed(),
        }
      );
      this._amount.load();
      this.logger.log(
        "Amounts Swapped To",
        window.EngridAmounts[this._frequency.frequency]
      );
    }
  }

  // Watch for a clicks on monthly-upsell link
  private upsold(e: Event) {
    // Find and select monthly giving
    const enFieldRecurrpay = document.querySelector(
      ".en__field--recurrpay input[value='Y']"
    ) as HTMLInputElement;
    if (enFieldRecurrpay) {
      enFieldRecurrpay.checked = true;
    }

    // Find the hidden radio select that needs to be selected when entering an "Other" amount
    const enFieldOtherAmountRadio = document.querySelector(
      ".en__field--donationAmt input[value='other']"
    ) as HTMLInputElement;
    if (enFieldOtherAmountRadio) {
      enFieldOtherAmountRadio.checked = true;
    }

    // Enter the other amount and remove the "en__field__item--hidden" class from the input's parent
    const enFieldOtherAmount = document.querySelector(
      "input[name='transaction.donationAmt.other']"
    ) as HTMLInputElement;
    if (enFieldOtherAmount) {
      enFieldOtherAmount.value = this.getUpsellAmountRaw(
        this._amount.amount * this.multiplier
      );
      this._amount.load();
      this._frequency.load();
      if (enFieldOtherAmount.parentElement) {
        enFieldOtherAmount.parentElement.classList.remove(
          "en__field__item--hidden"
        );
      }
    }

    const target = e.target as HTMLLinkElement;
    if (target && target.classList.contains("form-submit")) {
      e.preventDefault();
      // Form submit
      this._form.submitForm();
    }
  }
}
