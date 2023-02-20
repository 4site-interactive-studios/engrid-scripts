// Populates hidden supporter field "Region Long Format" with expanded name (e.g FL becomes Florida)
import { ENGrid, EngridLogger } from "./";
import { EnForm } from "./events";
export class ExpandRegionName {
    constructor() {
        this._form = EnForm.getInstance();
        this.logger = new EngridLogger("Expand Region Name");
        if (this.shouldRun()) {
            const expandedRegionField = ENGrid.getOption("RegionLongFormat");
            this.logger.log("expandedRegionField", expandedRegionField);
            const hiddenRegion = document.querySelector(`[name="${expandedRegionField}"]`);
            if (!hiddenRegion) {
                this.logger.log(`CREATED field ${expandedRegionField}`);
                ENGrid.createHiddenInput(expandedRegionField);
            }
            this._form.onSubmit.subscribe(() => this.expandRegion());
        }
    }
    shouldRun() {
        return !!ENGrid.getOption("RegionLongFormat");
    }
    expandRegion() {
        const userRegion = document.querySelector('[name="supporter.region"]'); // User entered region on the page
        const expandedRegionField = ENGrid.getOption("RegionLongFormat");
        const hiddenRegion = document.querySelector(`[name="${expandedRegionField}"]`); // Hidden region long form field
        if (!userRegion) {
            this.logger.log("No region field to populate the hidden region field with");
            return; // Don't populate hidden region field if user region field isn't on page
        }
        if (userRegion.tagName === "SELECT" && "options" in userRegion) {
            const regionValue = userRegion.options[userRegion.selectedIndex].innerText;
            hiddenRegion.value = regionValue;
            this.logger.log("Populated field", hiddenRegion.value);
        }
        else if (userRegion.tagName === "INPUT") {
            const regionValue = userRegion.value;
            hiddenRegion.value = regionValue;
            this.logger.log("Populated field", hiddenRegion.value);
        }
        return true;
    }
}
