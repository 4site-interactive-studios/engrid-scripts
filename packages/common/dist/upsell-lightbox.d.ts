import { DonationAmount } from "./events";
export declare class UpsellLightbox {
    private options;
    private overlay;
    private _form;
    _amount: DonationAmount;
    private _frequency;
    constructor();
    private renderLightbox;
    private shouldRun;
    private popupOtherField;
    private liveAmounts;
    private getUpsellAmount;
    private shouldOpen;
    private open;
    private setOriginalAmount;
    private continue;
    private close;
}
