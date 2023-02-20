import { ENGrid, EngridLogger } from "./";
import { DonationFrequency } from "./events";

export class setRecurrFreq {
  private _frequency: DonationFrequency = DonationFrequency.getInstance();
  private linkClass: string = "setRecurrFreq-";
  private checkboxName: string = "engrid.recurrfreq";
  private logger: EngridLogger = new EngridLogger("Set Recurring Frequency");

  constructor() {
    // Watch the links that starts with linkClass
    document
      .querySelectorAll(`a[class^="${this.linkClass}"]`)
      .forEach((element) => {
        element.addEventListener("click", (e: Event) => {
          // Get the right class
          const setRecurrFreqClass = element.className
            .split(" ")
            .filter((linkClass) => linkClass.startsWith(this.linkClass));
          this.logger.log(setRecurrFreqClass);
          if (setRecurrFreqClass.length) {
            e.preventDefault();
            ENGrid.setFieldValue(
              "transaction.recurrfreq",
              setRecurrFreqClass[0]
                .substring(this.linkClass.length)
                .toUpperCase()
            );
            this._frequency.load();
          }
        });
      });

    const currentFrequency = ENGrid.getFieldValue(
      "transaction.recurrfreq"
    ).toUpperCase();

    // Watch checkboxes with the name checkboxName
    (
      document.getElementsByName(
        this.checkboxName
      ) as NodeListOf<HTMLInputElement>
    ).forEach((element) => {
      // Set checked status per currently-set frequency
      const frequency = element.value.toUpperCase();
      if (frequency === currentFrequency) {
        element.checked = true;
      } else {
        element.checked = false;
      }

      element.addEventListener("change", () => {
        const frequency = element.value.toUpperCase();
        if (element.checked) {
          ENGrid.setFieldValue("transaction.recurrfreq", frequency);
          ENGrid.setFieldValue("transaction.recurrpay", "Y");
          this._frequency.load();
        } else if (frequency !== "ONETIME") {
          ENGrid.setFieldValue("transaction.recurrfreq", "ONETIME");
          ENGrid.setFieldValue("transaction.recurrpay", "N");
          this._frequency.load();
        }
      });
    });
    // Uncheck the checkbox when frequency != checkbox value
    this._frequency.onFrequencyChange.subscribe(() => {
      const currentFrequency = this._frequency.frequency.toUpperCase();
      (
        document.getElementsByName(
          this.checkboxName
        ) as NodeListOf<HTMLInputElement>
      ).forEach((element) => {
        const elementFrequency = element.value.toUpperCase();
        if (element.checked && elementFrequency !== currentFrequency) {
          element.checked = false;
        } else if (!element.checked && elementFrequency === currentFrequency) {
          element.checked = true;
        }
      });
    });
  }
}
