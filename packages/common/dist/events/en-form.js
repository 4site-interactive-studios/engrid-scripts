import { SignalDispatcher } from "strongly-typed-events";
import { EngridLogger } from "../";
export class EnForm {
    constructor() {
        this.logger = new EngridLogger("EnForm");
        this._onSubmit = new SignalDispatcher();
        this._onValidate = new SignalDispatcher();
        this._onError = new SignalDispatcher();
        this.submit = true;
        this.submitPromise = false;
        this.validate = true;
        this.validatePromise = false;
    }
    static getInstance() {
        if (!EnForm.instance) {
            EnForm.instance = new EnForm();
        }
        return EnForm.instance;
    }
    dispatchSubmit() {
        this._onSubmit.dispatch();
        this.logger.log("dispatchSubmit");
    }
    dispatchValidate() {
        this._onValidate.dispatch();
        this.logger.log("dispatchValidate");
    }
    dispatchError() {
        this._onError.dispatch();
        this.logger.log("dispatchError");
    }
    submitForm() {
        const enForm = document.querySelector("form .en__submit button");
        if (enForm) {
            // Add submitting class to modal
            const enModal = document.getElementById("enModal");
            if (enModal)
                enModal.classList.add("is-submitting");
            enForm.click();
            this.logger.log("submitForm");
        }
    }
    get onSubmit() {
        this.logger.log("onSubmit");
        return this._onSubmit.asEvent();
    }
    get onError() {
        this.logger.log("onError");
        return this._onError.asEvent();
    }
    get onValidate() {
        this.logger.log("onValidate");
        return this._onValidate.asEvent();
    }
}
