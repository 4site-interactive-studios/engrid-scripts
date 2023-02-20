// A way to gracefully handle deprecation.
// Find and replace HTML Elements, Classes, and more after the DOM is loaded but before any other Javascript fires.
import { EngridLogger } from "./";
export class Deprecated {
    constructor() {
        this.logger = new EngridLogger("Deprecated");
        let deprecated;
        let replacement;
        // Checks for body-side class
        deprecated = document.querySelector(".body-side");
        if (deprecated) {
            this.warning(deprecated);
        }
        // Checks for backgroundImage class
        deprecated = document.querySelector(".backgroundImage");
        if (deprecated) {
            replacement = "background-image";
            this.replace(deprecated, replacement);
        }
        // Checks for backgroundImageOverlay class
        deprecated = document.querySelector(".backgroundImageOverlay");
        if (deprecated) {
            replacement = "background-image-overlay";
            this.replace(deprecated, replacement);
        }
    }
    warning(deprecated) {
        this.logger.log("Deprecated: '" + deprecated + "' was detected and nothing was done.");
    }
    replace(deprecated, replacement) {
        this.logger.log("Deprecated: '" +
            deprecated +
            "' was detected and replaced with '" +
            replacement +
            "'.");
        deprecated.classList.add(replacement);
        deprecated.classList.remove(deprecated);
    }
}
