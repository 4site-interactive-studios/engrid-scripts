import { ENGrid } from "./";
import { DonationFrequency } from "./events";
export class setRecurrFreq {
    constructor() {
        this._frequency = DonationFrequency.getInstance();
        this.linkClass = 'setRecurrFreq-';
        this.checkboxName = 'engrid.recurrfreq';
        // Watch the links that starts with linkClass
        document.querySelectorAll(`a[class^="${this.linkClass}"]`).forEach(element => {
            element.addEventListener("click", (e) => {
                // Get the right class
                const setRecurrFreqClass = element.className.split(' ').filter(linkClass => linkClass.startsWith(this.linkClass));
                if (ENGrid.debug)
                    console.log(setRecurrFreqClass);
                if (setRecurrFreqClass.length) {
                    e.preventDefault();
                    ENGrid.setFieldValue('transaction.recurrfreq', setRecurrFreqClass[0].substring(this.linkClass.length).toUpperCase());
                    this._frequency.load();
                }
            });
        });
        // Watch checkboxes with the name checkboxName
        document.getElementsByName(this.checkboxName).forEach((element) => {
            element.addEventListener("change", () => {
                if (element.checked) {
                    ENGrid.setFieldValue('transaction.recurrfreq', element.value.toUpperCase());
                    this._frequency.load();
                }
            });
        });
        // Uncheck the checkbox when frequency != checkbox value
        this._frequency.onFrequencyChange.subscribe(() => {
            const freq = this._frequency.frequency.toUpperCase();
            document.getElementsByName(this.checkboxName).forEach((element) => {
                if (element.checked && element.value != freq) {
                    element.checked = false;
                }
            });
        });
    }
}
