import { Options } from "./";
export declare abstract class ENGrid {
    constructor();
    static get enForm(): HTMLFormElement;
    static get debug(): boolean;
    static getUrlParameter(name: string): string;
    static getFieldValue(name: string): string;
    static setFieldValue(name: string, value: unknown): void;
    static enParseDependencies(): void;
    static getGiftProcess(): any;
    static getPageCount(): any;
    static getPageNumber(): any;
    static getPageID(): any;
    static getPageType(): "ECARD" | "SURVEY" | "ADVOCACY" | "SUBSCRIBEFORM" | "DONATION";
    static setBodyData(dataName: string, value: string): void;
    static getBodyData(dataName: string): string | null;
    static getOption<K extends keyof Options>(key: K): Options[K] | null;
    static loadJS(url: string, onload?: (() => void) | null, head?: boolean): void;
}
