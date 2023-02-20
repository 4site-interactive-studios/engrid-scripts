import { SignalDispatcher } from "strongly-typed-events";
import { EngridLogger } from "../";

export class EnForm {
  private logger: EngridLogger = new EngridLogger("EnForm");
  private _onSubmit = new SignalDispatcher();
  private _onValidate = new SignalDispatcher();
  private _onError = new SignalDispatcher();
  public submit: boolean = true;
  public submitPromise: boolean | Promise<void> = false;
  public validate: boolean = true;
  public validatePromise: boolean | Promise<void> = false;

  private static instance: EnForm;

  private constructor() {}

  public static getInstance(): EnForm {
    if (!EnForm.instance) {
      EnForm.instance = new EnForm();
    }

    return EnForm.instance;
  }

  public dispatchSubmit() {
    this._onSubmit.dispatch();
    this.logger.log("dispatchSubmit");
  }

  public dispatchValidate() {
    this._onValidate.dispatch();
    this.logger.log("dispatchValidate");
  }

  public dispatchError() {
    this._onError.dispatch();
    this.logger.log("dispatchError");
  }

  public submitForm() {
    const enForm = document.querySelector(
      "form .en__submit button"
    ) as HTMLButtonElement;
    if (enForm) {
      // Add submitting class to modal
      const enModal = document.getElementById("enModal");
      if (enModal) enModal.classList.add("is-submitting");
      enForm.click();
      this.logger.log("submitForm");
    }
  }

  public get onSubmit() {
    this.logger.log("onSubmit");
    return this._onSubmit.asEvent();
  }

  public get onError() {
    this.logger.log("onError");
    return this._onError.asEvent();
  }

  public get onValidate() {
    this.logger.log("onValidate");
    return this._onValidate.asEvent();
  }
}
