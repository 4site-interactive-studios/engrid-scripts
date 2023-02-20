import { EngridLogger } from "./";
import { EnForm } from "./events";
export class CapitalizeFields {
    constructor() {
        this._form = EnForm.getInstance();
        this.logger = new EngridLogger("Capitalize Fields");
        this._form.onSubmit.subscribe(() => this.capitalizeFields("en__field_supporter_firstName", "en__field_supporter_lastName", "en__field_supporter_address1", "en__field_supporter_city"));
    }
    capitalizeFields(...fields) {
        fields.forEach((f) => this.capitalize(f));
    }
    capitalize(f) {
        let field = document.getElementById(f);
        if (field) {
            field.value = field.value.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
            this.logger.log("Capitalized", field.value);
        }
        return true;
    }
}
