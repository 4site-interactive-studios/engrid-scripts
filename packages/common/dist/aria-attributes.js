// This Component is supposed to be used as a helper for Arria Attributes
export class AriaAttributes {
    constructor() {
        this.addRequired();
        this.addLabel();
    }
    addRequired() {
        const mandatoryFields = document.querySelectorAll(".en__mandatory .en__field__input");
        mandatoryFields.forEach((field) => {
            field.setAttribute("aria-required", "true");
        });
    }
    addLabel() {
        const otherAmount = document.querySelector(".en__field__input--otheramount");
        if (otherAmount) {
            otherAmount.setAttribute("aria-label", "Enter your custom donation amount");
        }
        // Split selects usually don't have a label, so let's make the first option the label
        const splitSelects = document.querySelectorAll(".en__field__input--splitselect");
        splitSelects.forEach((select) => {
            const firstOption = select.querySelector("option");
            if (firstOption) {
                select.setAttribute("aria-label", firstOption.textContent || "");
            }
        });
    }
}
