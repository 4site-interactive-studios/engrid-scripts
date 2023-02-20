import { DonationAmount, ProcessingFees } from "./events";
import { Options } from "./";
export declare class LiveVariables {
    _amount: DonationAmount;
    _fees: ProcessingFees;
    private _frequency;
    private _form;
    private multiplier;
    private submitLabel;
    private options;
    private logger;
    constructor(options: Options);
    private getAmountTxt;
    private getUpsellAmountTxt;
    private getUpsellAmountRaw;
    changeSubmitButton(): void;
    loadingSubmitButton(): boolean;
    changeLiveAmount(): void;
    changeLiveUpsellAmount(): void;
    changeLiveFrequency(): void;
    changeRecurrency(): void;
    swapAmounts(): void;
    private upsold;
}
