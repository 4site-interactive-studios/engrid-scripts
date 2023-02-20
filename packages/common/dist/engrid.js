export class ENGrid {
    constructor() {
        if (!ENGrid.enForm) {
            throw new Error("Engaging Networks Form Not Found!");
        }
    }
    static get enForm() {
        return document.querySelector("form.en__component");
    }
    static get debug() {
        return !!this.getOption("Debug");
    }
    static get demo() {
        return this.getUrlParameter("mode") === "DEMO";
    }
    // Return any parameter from the URL
    static getUrlParameter(name) {
        const searchParams = new URLSearchParams(window.location.search);
        // Add support for array on the name ending with []
        if (name.endsWith("[]")) {
            let values = [];
            searchParams.forEach((value, key) => {
                if (key.startsWith(name.replace("[]", ""))) {
                    values.push(new Object({ [key]: value }));
                }
            });
            return values.length > 0 ? values : null;
        }
        if (searchParams.has(name)) {
            return searchParams.get(name) || true;
        }
        return null;
    }
    static getField(name) {
        // Get the field by name
        return document.querySelector(`[name="${name}"]`);
    }
    // Return the field value from its name. It works on any field type.
    // Multiple values (from checkboxes or multi-select) are returned as single string
    // Separated by ,
    static getFieldValue(name) {
        return new FormData(this.enForm).getAll(name).join(",");
    }
    // Set a value to any field. If it's a dropdown, radio or checkbox, it selects the proper option matching the value
    static setFieldValue(name, value, parseENDependencies = true) {
        if (value === ENGrid.getFieldValue(name))
            return;
        document.getElementsByName(name).forEach((field) => {
            if ("type" in field) {
                switch (field.type) {
                    case "select-one":
                    case "select-multiple":
                        for (const option of field.options) {
                            if (option.value == value) {
                                option.selected = true;
                            }
                        }
                        break;
                    case "checkbox":
                    case "radio":
                        // @TODO: Try to trigger the onChange event
                        if (field.value == value) {
                            field.checked = true;
                        }
                        break;
                    case "textarea":
                    case "text":
                    default:
                        field.value = value;
                }
                field.setAttribute("engrid-value-changed", "");
            }
        });
        if (parseENDependencies)
            this.enParseDependencies();
        return;
    }
    // Create a hidden input field
    static createHiddenInput(name, value = "") {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.classList.add("en__field__input");
        input.classList.add("en__field__input--text");
        input.classList.add("engrid-added-input");
        input.value = value;
        ENGrid.enForm.appendChild(input);
        return input;
    }
    // Trigger EN Dependencies
    static enParseDependencies() {
        var _a, _b, _c, _d, _e, _f;
        if (window.EngagingNetworks &&
            typeof ((_e = (_d = (_c = (_b = (_a = window.EngagingNetworks) === null || _a === void 0 ? void 0 : _a.require) === null || _b === void 0 ? void 0 : _b._defined) === null || _c === void 0 ? void 0 : _c.enDependencies) === null || _d === void 0 ? void 0 : _d.dependencies) === null || _e === void 0 ? void 0 : _e.parseDependencies) === "function") {
            const customDependencies = [];
            if ("dependencies" in window.EngagingNetworks) {
                const amountContainer = document.querySelector(".en__field--donationAmt");
                if (amountContainer) {
                    let amountID = ((_f = [...amountContainer.classList.values()]
                        .filter((v) => v.startsWith("en__field--") && Number(v.substring(11)) > 0)
                        .toString()
                        .match(/\d/g)) === null || _f === void 0 ? void 0 : _f.join("")) || "";
                    if (amountID) {
                        window.EngagingNetworks.dependencies.forEach((dependency) => {
                            if ("actions" in dependency && dependency.actions.length > 0) {
                                let amountIdFound = false;
                                dependency.actions.forEach((action) => {
                                    if ("target" in action && action.target === amountID) {
                                        amountIdFound = true;
                                    }
                                });
                                if (!amountIdFound) {
                                    customDependencies.push(dependency);
                                }
                            }
                        });
                        if (customDependencies.length > 0) {
                            window.EngagingNetworks.require._defined.enDependencies.dependencies.parseDependencies(customDependencies);
                        }
                    }
                }
            }
        }
    }
    // Return the status of the gift process (true if a donation has been made, otherwise false)
    static getGiftProcess() {
        if ("pageJson" in window)
            return window.pageJson.giftProcess;
        return null;
    }
    // Return the page count
    static getPageCount() {
        if ("pageJson" in window)
            return window.pageJson.pageCount;
        return null;
    }
    // Return the current page number
    static getPageNumber() {
        if ("pageJson" in window)
            return window.pageJson.pageNumber;
        return null;
    }
    // Return the current page ID
    static getPageID() {
        if ("pageJson" in window)
            return window.pageJson.campaignPageId;
        return 0;
    }
    // Return the current page type
    static getPageType() {
        if ("pageJson" in window && "pageType" in window.pageJson) {
            switch (window.pageJson.pageType) {
                case "donation":
                case "premiumgift":
                    return "DONATION";
                    break;
                case "e-card":
                    return "ECARD";
                    break;
                case "otherdatacapture":
                case "survey":
                    return "SURVEY";
                    break;
                case "emailtotarget":
                    return "EMAILTOTARGET";
                    break;
                case "advocacypetition":
                    return "ADVOCACY";
                    break;
                case "emailsubscribeform":
                    return "SUBSCRIBEFORM";
                    break;
                case "supporterhub":
                    return "SUPPORTERHUB";
                    break;
                case "unsubscribe":
                    return "UNSUBSCRIBE";
                    break;
                default:
                    return "UNKNOWN";
            }
        }
        else {
            return "UNKNOWN";
        }
    }
    // Set body engrid data attributes
    static setBodyData(dataName, value) {
        const body = document.querySelector("body");
        // If value is boolean
        if (typeof value === "boolean" && value === false) {
            body.removeAttribute(`data-engrid-${dataName}`);
            return;
        }
        body.setAttribute(`data-engrid-${dataName}`, value.toString());
    }
    // Get body engrid data attributes
    static getBodyData(dataName) {
        const body = document.querySelector("body");
        return body.getAttribute(`data-engrid-${dataName}`);
    }
    // Check if body has engrid data attributes
    static hasBodyData(dataName) {
        const body = document.querySelector("body");
        return body.hasAttribute(`data-engrid-${dataName}`);
    }
    // Return the option value
    static getOption(key) {
        return window.EngridOptions[key] || null;
    }
    // Load an external script
    static loadJS(url, onload = null, head = true) {
        const scriptTag = document.createElement("script");
        scriptTag.src = url;
        scriptTag.onload = onload;
        if (head) {
            document.head.appendChild(scriptTag);
            return;
        }
        document.body.appendChild(scriptTag);
        return;
    }
    // Format a number
    static formatNumber(number, decimals = 2, dec_point = ".", thousands_sep = ",") {
        // Strip all characters but numerical ones.
        number = (number + "").replace(/[^0-9+\-Ee.]/g, "");
        const n = !isFinite(+number) ? 0 : +number;
        const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
        const sep = typeof thousands_sep === "undefined" ? "," : thousands_sep;
        const dec = typeof dec_point === "undefined" ? "." : dec_point;
        let s = [];
        const toFixedFix = function (n, prec) {
            const k = Math.pow(10, prec);
            return "" + Math.round(n * k) / k;
        };
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || "").length < prec) {
            s[1] = s[1] || "";
            s[1] += new Array(prec - s[1].length + 1).join("0");
        }
        return s.join(dec);
    }
    // Clean an Amount
    static cleanAmount(amount) {
        // Split the number
        const valueArray = amount.replace(/[^0-9,\.]/g, "").split(/[,.]+/);
        const delimArray = amount.replace(/[^.,]/g, "").split("");
        // Handle values with no decimal places and non-numeric values
        if (valueArray.length === 1) {
            return parseInt(valueArray[0]) || 0;
        }
        // Ignore invalid numbers
        if (valueArray
            .map((x, index) => {
            return index > 0 && index + 1 !== valueArray.length && x.length !== 3
                ? true
                : false;
        })
            .includes(true)) {
            return 0;
        }
        // Multiple commas is a bad thing? So edgy.
        if (delimArray.length > 1 && !delimArray.includes(".")) {
            return 0;
        }
        // Handle invalid decimal and comma formatting
        if ([...new Set(delimArray.slice(0, -1))].length > 1) {
            return 0;
        }
        // If there are cents
        if (valueArray[valueArray.length - 1].length <= 2) {
            const cents = valueArray.pop() || "00";
            return parseInt(cents) > 0
                ? parseFloat(Number(parseInt(valueArray.join("")) + "." + cents).toFixed(2))
                : parseInt(valueArray.join(""));
        }
        return parseInt(valueArray.join(""));
    }
    static disableSubmit(label = "") {
        const submit = document.querySelector(".en__submit button");
        submit.dataset.originalText = submit.innerText;
        let submitButtonProcessingHTML = "<span class='loader-wrapper'><span class='loader loader-quart'></span><span class='submit-button-text-wrapper'>" +
            label +
            "</span></span>";
        if (submit) {
            submit.disabled = true;
            submit.innerHTML = submitButtonProcessingHTML;
            return true;
        }
        return false;
    }
    static enableSubmit() {
        const submit = document.querySelector(".en__submit button");
        if (submit.dataset.originalText) {
            submit.disabled = false;
            submit.innerText = submit.dataset.originalText;
            delete submit.dataset.originalText;
            return true;
        }
        return false;
    }
    static formatDate(date, format = "MM/DD/YYYY") {
        const dateAray = date
            .toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
            .split("/");
        const dateString = format
            .replace(/YYYY/g, dateAray[2])
            .replace(/MM/g, dateAray[0])
            .replace(/DD/g, dateAray[1])
            .replace(/YY/g, dateAray[2].substr(2, 2));
        return dateString;
    }
    /**
     * Check if the provided object has ALL the provided properties
     * Example: checkNested(EngagingNetworks, 'require', '_defined', 'enjs', 'checkSubmissionFailed')
     * will return true if EngagingNetworks.require._defined.enjs.checkSubmissionFailed is defined
     */
    static checkNested(obj, ...args) {
        for (let i = 0; i < args.length; i++) {
            if (!obj || !obj.hasOwnProperty(args[i])) {
                return false;
            }
            obj = obj[args[i]];
        }
        return true;
    }
    static setError(element, errorMessage) {
        const errorElement = typeof element === "string" ? document.querySelector(element) : element;
        if (errorElement) {
            errorElement.classList.add("en__field--validationFailed");
            let errorMessageElement = errorElement.querySelector(".en__field__error");
            if (!errorMessageElement) {
                errorMessageElement = document.createElement("div");
                errorMessageElement.classList.add("en__field__error");
                errorMessageElement.innerHTML = errorMessage;
                errorElement.insertBefore(errorMessageElement, errorElement.firstChild);
            }
            else {
                errorMessageElement.innerHTML = errorMessage;
            }
        }
    }
    static removeError(element) {
        const errorElement = typeof element === "string" ? document.querySelector(element) : element;
        if (errorElement) {
            errorElement.classList.remove("en__field--validationFailed");
            const errorMessageElement = errorElement.querySelector(".en__field__error");
            if (errorMessageElement) {
                errorElement.removeChild(errorMessageElement);
            }
        }
    }
    static isVisible(element) {
        return !!(element.offsetWidth ||
            element.offsetHeight ||
            element.getClientRects().length);
    }
    static getCurrencySymbol() {
        const currencyField = ENGrid.getField("transaction.paycurrency");
        if (currencyField) {
            const currencyArray = {
                USD: "$",
                EUR: "€",
                GBP: "£",
                AUD: "$",
                CAD: "$",
                JPY: "¥",
            };
            return currencyArray[currencyField.value] || "$";
        }
        return ENGrid.getOption("CurrencySymbol") || "$";
    }
    static getCurrencyCode() {
        const currencyField = ENGrid.getField("transaction.paycurrency");
        if (currencyField) {
            return currencyField.value || "USD";
        }
        return ENGrid.getOption("CurrencyCode") || "USD";
    }
}
