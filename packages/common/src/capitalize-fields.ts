import { EngridLogger } from "./";
import { EnForm } from "./events";

export class CapitalizeFields {
  public _form: EnForm = EnForm.getInstance();
  private logger: EngridLogger = new EngridLogger("Capitalize Fields");

  constructor() {
    this._form.onSubmit.subscribe(() =>
      this.capitalizeFields(
        "en__field_supporter_firstName",
        "en__field_supporter_lastName",
        "en__field_supporter_address1",
        "en__field_supporter_city"
      )
    );
  }

  private capitalizeFields(...fields: string[]) {
    fields.forEach((f) => this.capitalize(f));
  }

  private capitalize(f: string) {
    let field: HTMLInputElement = document.getElementById(
      f
    ) as HTMLInputElement;
    if (field) {
      field.value = field.value.replace(/\w\S*/g, (w) =>
        w.replace(/^\w/, (c) => c.toUpperCase())
      );
      this.logger.log("Capitalized", field.value);
    }
    return true;
  }
}
