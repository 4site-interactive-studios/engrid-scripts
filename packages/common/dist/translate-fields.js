import { TranslateOptionsDefaults } from ".";
import * as cookie from "./cookie";
// This class works when the user has added ".simple_country_select" as a class in page builder for the Country select
export class TranslateFields {
    constructor() {
        this.countrySelect = document.querySelector("#en__field_supporter_country");
        this.stateField = document.querySelector("#en__field_supporter_region");
        let options = "EngridTranslate" in window ? window.EngridTranslate : {};
        this.options = TranslateOptionsDefaults;
        if (options) {
            for (let key in options) {
                this.options[key] = [...this.options[key], ...options[key]];
            }
        }
        if (this.countrySelect) {
            this.countrySelect.addEventListener("change", this.translateFields.bind(this));
            this.translateFields();
        }
        if (this.stateField) {
            this.stateField.addEventListener("change", this.rememberState.bind(this));
        }
    }
    translateFields() {
        this.resetTranslatedFields();
        if (this.countrySelect.value in this.options) {
            this.options[this.countrySelect.value].forEach((field) => {
                this.translateField(field.field, field.translation);
            });
        }
        // Translate the "To:"
        const recipient_block = document.querySelectorAll(".recipient-block");
        if (!!recipient_block.length) {
            switch (this.countrySelect.value) {
                case "FR":
                case "FRA":
                case "France":
                    recipient_block.forEach((elem) => (elem.innerHTML = "À:"));
                    break;
                case "DE":
                case "DEU":
                case "Germany":
                    recipient_block.forEach((elem) => (elem.innerHTML = "Zu:"));
                    break;
                case "NL":
                case "NLD":
                case "Netherlands":
                    recipient_block.forEach((elem) => (elem.innerHTML = "Aan:"));
                    break;
            }
        }
        // Translate the State Field
        this.setStateField(this.countrySelect.value);
    }
    translateField(name, translation) {
        const field = document.querySelector(`[name="${name}"]`);
        if (field) {
            const fieldWrapper = field.closest(".en__field");
            if (fieldWrapper) {
                const fieldLabel = fieldWrapper.querySelector(".en__field__label");
                // Check if there's the simple country select class
                const simpleCountrySelect = fieldLabel.querySelector(".engrid-simple-country");
                let simpleCountrySelectClone = simpleCountrySelect
                    ? simpleCountrySelect.cloneNode(true)
                    : null;
                if (field instanceof HTMLInputElement && field.placeholder != "") {
                    if (!fieldLabel || fieldLabel.innerHTML == field.placeholder) {
                        field.dataset.original = field.placeholder;
                        field.placeholder = translation;
                    }
                }
                if (fieldLabel) {
                    fieldLabel.dataset.original = fieldLabel.innerHTML;
                    fieldLabel.innerHTML = translation;
                    if (simpleCountrySelectClone) {
                        fieldLabel.appendChild(simpleCountrySelectClone);
                    }
                }
            }
        }
    }
    resetTranslatedFields() {
        const fields = document.querySelectorAll("[data-original]");
        fields.forEach((field) => {
            if (field instanceof HTMLInputElement && field.dataset.original) {
                field.placeholder = field.dataset.original;
            }
            else {
                // Check if there's the simple country select class
                const simpleCountrySelect = field.querySelector(".engrid-simple-country");
                let simpleCountrySelectClone = simpleCountrySelect
                    ? simpleCountrySelect.cloneNode(true)
                    : null;
                field.innerHTML = field.dataset.original;
                if (simpleCountrySelectClone) {
                    field.appendChild(simpleCountrySelectClone);
                }
            }
            field.removeAttribute("data-original");
        });
    }
    setStateField(country) {
        switch (country) {
            case "BR":
            case "BRA":
            case "Brazil":
                this.setStateValues("Estado", null);
                break;
            case "FR":
            case "FRA":
            case "France":
                this.setStateValues("Région", null);
                break;
            case "GB":
            case "GBR":
            case "United Kingdom":
                this.setStateValues("State/Region", null);
                break;
            case "DE":
            case "DEU":
            case "Germany":
                this.setStateValues("Bundesland", null);
                break;
            case "NL":
            case "NLD":
            case "Netherlands":
                this.setStateValues("Provincie", null);
                break;
            case "AU":
            case "AUS":
                this.setStateValues("Province / State", [
                    { label: "Select", value: "" },
                    { label: "New South Wales", value: "NSW" },
                    { label: "Victoria", value: "VIC" },
                    { label: "Queensland", value: "QLD" },
                    { label: "South Australia", value: "SA" },
                    { label: "Western Australia", value: "WA" },
                    { label: "Tasmania", value: "TAS" },
                    { label: "Northern Territory", value: "NT" },
                    { label: "Australian Capital Territory", value: "ACT" },
                ]);
                break;
            case "Australia":
                this.setStateValues("Province / State", [
                    { label: "Select", value: "" },
                    { label: "New South Wales", value: "New South Wales" },
                    { label: "Victoria", value: "Victoria" },
                    { label: "Queensland", value: "Queensland" },
                    { label: "South Australia", value: "South Australia" },
                    { label: "Western Australia", value: "Western Australia" },
                    { label: "Tasmania", value: "Tasmania" },
                    { label: "Northern Territory", value: "Northern Territory" },
                    {
                        label: "Australian Capital Territory",
                        value: "Australian Capital Territory",
                    },
                ]);
                break;
            case "US":
            case "USA":
                this.setStateValues("State", [
                    { label: "Select State", value: "" },
                    { label: "Alabama", value: "AL" },
                    { label: "Alaska", value: "AK" },
                    { label: "Arizona", value: "AZ" },
                    { label: "Arkansas", value: "AR" },
                    { label: "California", value: "CA" },
                    { label: "Colorado", value: "CO" },
                    { label: "Connecticut", value: "CT" },
                    { label: "Delaware", value: "DE" },
                    { label: "District of Columbia", value: "DC" },
                    { label: "Florida", value: "FL" },
                    { label: "Georgia", value: "GA" },
                    { label: "Hawaii", value: "HI" },
                    { label: "Idaho", value: "ID" },
                    { label: "Illinois", value: "IL" },
                    { label: "Indiana", value: "IN" },
                    { label: "Iowa", value: "IA" },
                    { label: "Kansas", value: "KS" },
                    { label: "Kentucky", value: "KY" },
                    { label: "Louisiana", value: "LA" },
                    { label: "Maine", value: "ME" },
                    { label: "Maryland", value: "MD" },
                    { label: "Massachusetts", value: "MA" },
                    { label: "Michigan", value: "MI" },
                    { label: "Minnesota", value: "MN" },
                    { label: "Mississippi", value: "MS" },
                    { label: "Missouri", value: "MO" },
                    { label: "Montana", value: "MT" },
                    { label: "Nebraska", value: "NE" },
                    { label: "Nevada", value: "NV" },
                    { label: "New Hampshire", value: "NH" },
                    { label: "New Jersey", value: "NJ" },
                    { label: "New Mexico", value: "NM" },
                    { label: "New York", value: "NY" },
                    { label: "North Carolina", value: "NC" },
                    { label: "North Dakota", value: "ND" },
                    { label: "Ohio", value: "OH" },
                    { label: "Oklahoma", value: "OK" },
                    { label: "Oregon", value: "OR" },
                    { label: "Pennsylvania", value: "PA" },
                    { label: "Rhode Island", value: "RI" },
                    { label: "South Carolina", value: "SC" },
                    { label: "South Dakota", value: "SD" },
                    { label: "Tennessee", value: "TN" },
                    { label: "Texas", value: "TX" },
                    { label: "Utah", value: "UT" },
                    { label: "Vermont", value: "VT" },
                    { label: "Virginia", value: "VA" },
                    { label: "Washington", value: "WA" },
                    { label: "West Virginia", value: "WV" },
                    { label: "Wisconsin", value: "WI" },
                    { label: "Wyoming", value: "WY" },
                ]);
                break;
            case "United States":
                this.setStateValues("State", [
                    { label: "Select State", value: "" },
                    { label: "Alabama", value: "Alabama" },
                    { label: "Alaska", value: "Alaska" },
                    { label: "Arizona", value: "Arizona" },
                    { label: "Arkansas", value: "Arkansas" },
                    { label: "California", value: "California" },
                    { label: "Colorado", value: "Colorado" },
                    { label: "Connecticut", value: "Connecticut" },
                    { label: "Delaware", value: "Delaware" },
                    { label: "District of Columbia", value: "District of Columbia" },
                    { label: "Florida", value: "Florida" },
                    { label: "Georgia", value: "Georgia" },
                    { label: "Hawaii", value: "Hawaii" },
                    { label: "Idaho", value: "Idaho" },
                    { label: "Illinois", value: "Illinois" },
                    { label: "Indiana", value: "Indiana" },
                    { label: "Iowa", value: "Iowa" },
                    { label: "Kansas", value: "Kansas" },
                    { label: "Kentucky", value: "Kentucky" },
                    { label: "Louisiana", value: "Louisiana" },
                    { label: "Maine", value: "Maine" },
                    { label: "Maryland", value: "Maryland" },
                    { label: "Massachusetts", value: "Massachusetts" },
                    { label: "Michigan", value: "Michigan" },
                    { label: "Minnesota", value: "Minnesota" },
                    { label: "Mississippi", value: "Mississippi" },
                    { label: "Missouri", value: "Missouri" },
                    { label: "Montana", value: "Montana" },
                    { label: "Nebraska", value: "Nebraska" },
                    { label: "Nevada", value: "Nevada" },
                    { label: "New Hampshire", value: "New Hampshire" },
                    { label: "New Jersey", value: "New Jersey" },
                    { label: "New Mexico", value: "New Mexico" },
                    { label: "New York", value: "New York" },
                    { label: "North Carolina", value: "North Carolina" },
                    { label: "North Dakota", value: "North Dakota" },
                    { label: "Ohio", value: "Ohio" },
                    { label: "Oklahoma", value: "Oklahoma" },
                    { label: "Oregon", value: "Oregon" },
                    { label: "Pennsylvania", value: "Pennsylvania" },
                    { label: "Rhode Island", value: "Rhode Island" },
                    { label: "South Carolina", value: "South Carolina" },
                    { label: "South Dakota", value: "South Dakota" },
                    { label: "Tennessee", value: "Tennessee" },
                    { label: "Texas", value: "Texas" },
                    { label: "Utah", value: "Utah" },
                    { label: "Vermont", value: "Vermont" },
                    { label: "Virginia", value: "Virginia" },
                    { label: "Washington", value: "Washington" },
                    { label: "West Virginia", value: "West Virginia" },
                    { label: "Wisconsin", value: "Wisconsin" },
                    { label: "Wyoming", value: "Wyoming" },
                ]);
                break;
            case "CA":
            case "CAN":
                this.setStateValues("Province / Territory", [
                    { label: "Select", value: "" },
                    { label: "Alberta", value: "AB" },
                    { label: "British Columbia", value: "BC" },
                    { label: "Manitoba", value: "MB" },
                    { label: "New Brunswick", value: "NB" },
                    { label: "Newfoundland and Labrador", value: "NL" },
                    { label: "Northwest Territories", value: "NT" },
                    { label: "Nova Scotia", value: "NS" },
                    { label: "Nunavut", value: "NU" },
                    { label: "Ontario", value: "ON" },
                    { label: "Prince Edward Island", value: "PE" },
                    { label: "Quebec", value: "QC" },
                    { label: "Saskatchewan", value: "SK" },
                    { label: "Yukon", value: "YT" },
                ]);
                break;
            case "Canada":
                this.setStateValues("Province / Territory", [
                    { label: "Select", value: "" },
                    { label: "Alberta", value: "Alberta" },
                    { label: "British Columbia", value: "British Columbia" },
                    { label: "Manitoba", value: "Manitoba" },
                    { label: "New Brunswick", value: "New Brunswick" },
                    {
                        label: "Newfoundland and Labrador",
                        value: "Newfoundland and Labrador",
                    },
                    { label: "Northwest Territories", value: "Northwest Territories" },
                    { label: "Nova Scotia", value: "Nova Scotia" },
                    { label: "Nunavut", value: "Nunavut" },
                    { label: "Ontario", value: "Ontario" },
                    { label: "Prince Edward Island", value: "Prince Edward Island" },
                    { label: "Quebec", value: "Quebec" },
                    { label: "Saskatchewan", value: "Saskatchewan" },
                    { label: "Yukon", value: "Yukon" },
                ]);
                break;
            case "MX":
            case "MEX":
                this.setStateValues("Estado", [
                    { label: "Seleccione Estado", value: "" },
                    { label: "Aguascalientes", value: "AGU" },
                    { label: "Baja California", value: "BCN" },
                    { label: "Baja California Sur", value: "BCS" },
                    { label: "Campeche", value: "CAM" },
                    { label: "Chiapas", value: "CHP" },
                    { label: "Ciudad de Mexico", value: "CMX" },
                    { label: "Chihuahua", value: "CHH" },
                    { label: "Coahuila", value: "COA" },
                    { label: "Colima", value: "COL" },
                    { label: "Durango", value: "DUR" },
                    { label: "Guanajuato", value: "GUA" },
                    { label: "Guerrero", value: "GRO" },
                    { label: "Hidalgo", value: "HID" },
                    { label: "Jalisco", value: "JAL" },
                    { label: "Michoacan", value: "MIC" },
                    { label: "Morelos", value: "MOR" },
                    { label: "Nayarit", value: "NAY" },
                    { label: "Nuevo Leon", value: "NLE" },
                    { label: "Oaxaca", value: "OAX" },
                    { label: "Puebla", value: "PUE" },
                    { label: "Queretaro", value: "QUE" },
                    { label: "Quintana Roo", value: "ROO" },
                    { label: "San Luis Potosi", value: "SLP" },
                    { label: "Sinaloa", value: "SIN" },
                    { label: "Sonora", value: "SON" },
                    { label: "Tabasco", value: "TAB" },
                    { label: "Tamaulipas", value: "TAM" },
                    { label: "Tlaxcala", value: "TLA" },
                    { label: "Veracruz", value: "VER" },
                    { label: "Yucatan", value: "YUC" },
                    { label: "Zacatecas", value: "ZAC" },
                ]);
                break;
            case "Mexico":
                this.setStateValues("Estado", [
                    { label: "Seleccione Estado", value: "" },
                    { label: "Aguascalientes", value: "Aguascalientes" },
                    { label: "Baja California", value: "Baja California" },
                    { label: "Baja California Sur", value: "Baja California Sur" },
                    { label: "Campeche", value: "Campeche" },
                    { label: "Chiapas", value: "Chiapas" },
                    { label: "Ciudad de Mexico", value: "Ciudad de Mexico" },
                    { label: "Chihuahua", value: "Chihuahua" },
                    { label: "Coahuila", value: "Coahuila" },
                    { label: "Colima", value: "Colima" },
                    { label: "Durango", value: "Durango" },
                    { label: "Guanajuato", value: "Guanajuato" },
                    { label: "Guerrero", value: "Guerrero" },
                    { label: "Hidalgo", value: "Hidalgo" },
                    { label: "Jalisco", value: "Jalisco" },
                    { label: "Michoacan", value: "Michoacan" },
                    { label: "Morelos", value: "Morelos" },
                    { label: "Nayarit", value: "Nayarit" },
                    { label: "Nuevo Leon", value: "Nuevo Leon" },
                    { label: "Oaxaca", value: "Oaxaca" },
                    { label: "Puebla", value: "Puebla" },
                    { label: "Queretaro", value: "Queretaro" },
                    { label: "Quintana Roo", value: "Quintana Roo" },
                    { label: "San Luis Potosi", value: "San Luis Potosi" },
                    { label: "Sinaloa", value: "Sinaloa" },
                    { label: "Sonora", value: "Sonora" },
                    { label: "Tabasco", value: "Tabasco" },
                    { label: "Tamaulipas", value: "Tamaulipas" },
                    { label: "Tlaxcala", value: "Tlaxcala" },
                    { label: "Veracruz", value: "Veracruz" },
                    { label: "Yucatan", value: "Yucatan" },
                    { label: "Zacatecas", value: "Zacatecas" },
                ]);
                break;
            default:
                this.setStateValues("Province / State", null);
                break;
        }
    }
    setStateValues(label, values) {
        const stateField = document.querySelector("#en__field_supporter_region");
        const stateWrapper = stateField ? stateField.closest(".en__field") : null;
        if (stateWrapper) {
            const stateLabel = stateWrapper.querySelector(".en__field__label");
            const elementWrapper = stateWrapper.querySelector(".en__field__element");
            if (stateLabel) {
                stateLabel.innerHTML = label;
            }
            if (elementWrapper) {
                const selectedState = cookie.get("engrid-state");
                if (values === null || values === void 0 ? void 0 : values.length) {
                    const select = document.createElement("select");
                    select.name = "supporter.region";
                    select.id = "en__field_supporter_region";
                    select.classList.add("en__field__input");
                    select.classList.add("en__field__input--select");
                    select.autocomplete = "address-level1";
                    values.forEach((value) => {
                        const option = document.createElement("option");
                        option.value = value.value;
                        option.innerHTML = value.label;
                        if (selectedState === value.value) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });
                    elementWrapper.innerHTML = "";
                    elementWrapper.appendChild(select);
                    select.addEventListener("change", this.rememberState.bind(this));
                }
                else {
                    elementWrapper.innerHTML = "";
                    const input = document.createElement("input");
                    input.type = "text";
                    input.name = "supporter.region";
                    input.placeholder = label;
                    input.id = "en__field_supporter_region";
                    input.classList.add("en__field__input");
                    input.classList.add("en__field__input--text");
                    input.autocomplete = "address-level1";
                    if (selectedState) {
                        input.value = selectedState;
                    }
                    elementWrapper.appendChild(input);
                    input.addEventListener("change", this.rememberState.bind(this));
                }
            }
        }
    }
    rememberState() {
        const stateField = document.querySelector("#en__field_supporter_region");
        if (stateField) {
            cookie.set("engrid-state", stateField.value, {
                expires: 1,
                sameSite: "none",
                secure: true,
            });
        }
    }
}
