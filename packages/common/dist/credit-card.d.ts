export declare class CreditCard {
    private logger;
    private _form;
    private ccField;
    private field_expiration_month;
    private field_expiration_year;
    private paymentTypeField;
    constructor();
    private addEventListeners;
    private onlyNumbersCC;
    handleCCUpdate(): void;
    private handleExpUpdate;
    private getCardType;
}
