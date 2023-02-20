import { EnForm, DonationAmount, ProcessingFees } from "./";
export declare class ApplePay {
    applePay: HTMLInputElement;
    _amount: DonationAmount;
    _fees: ProcessingFees;
    _form: EnForm;
    private logger;
    constructor();
    private checkApplePay;
    performValidation(url: string): Promise<unknown>;
    private log;
    sendPaymentToken(token: any): Promise<unknown>;
    private onPayClicked;
}
