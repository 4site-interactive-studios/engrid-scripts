// This class adds the autocomplete attribute to
// the most common input elements
import { EngridLogger } from "./";
export class Autocomplete {
    constructor() {
        this.logger = new EngridLogger("Autocomplete");
        this.autoCompleteField('[name="supporter.firstName"]', "given-name");
        this.autoCompleteField('[name="supporter.lastName"]', "family-name");
        this.autoCompleteField('[name="transaction.ccnumber"]', "cc-number");
        this.autoCompleteField("#en__field_transaction_ccexpire", "cc-exp-month");
        this.autoCompleteField('[name="transaction.ccexpire"]:not(#en__field_transaction_ccexpire)', "cc-exp-year");
        this.autoCompleteField('[name="transaction.ccvv"]', "cc-csc");
        this.autoCompleteField('[name="supporter.emailAddress"]', "email");
        this.autoCompleteField('[name="supporter.phoneNumber"]', "tel");
        this.autoCompleteField('[name="supporter.country"]', "country");
        this.autoCompleteField('[name="supporter.address1"]', "address-line1");
        this.autoCompleteField('[name="supporter.address2"]', "address-line2");
        this.autoCompleteField('[name="supporter.city"]', "address-level2");
        this.autoCompleteField('[name="supporter.region"]', "address-level1");
        this.autoCompleteField('[name="supporter.postcode"]', "postal-code");
        // Ignore Autocomplete on the Recipient Email Field
        this.autoCompleteField('[name="transaction.infemail"]', "none");
    }
    autoCompleteField(querySelector, autoCompleteValue) {
        let field = document.querySelector(querySelector);
        if (field) {
            field.autocomplete = autoCompleteValue;
            return true;
        }
        this.logger.log("Field Not Found", querySelector);
        return false;
    }
}
