// A way to gracefully handle deprecation.
// Find and replace HTML Elements, Classes, and more after the DOM is loaded but before any other Javascript fires.

import { EngridLogger } from "./";

export class Deprecated {
  private logger: EngridLogger = new EngridLogger("Deprecated");

  constructor() {
    let deprecated;
    let replacement;

    // Checks for body-side class
    deprecated = document.querySelector(".body-side") as HTMLDivElement;
    if (deprecated) {
      this.warning(deprecated);
    }

    // Checks for backgroundImage class
    deprecated = document.querySelector(".backgroundImage") as HTMLDivElement;
    if (deprecated) {
      replacement = "background-image";
      this.replace(deprecated, replacement);
    }

    // Checks for backgroundImageOverlay class
    deprecated = document.querySelector(
      ".backgroundImageOverlay"
    ) as HTMLDivElement;
    if (deprecated) {
      replacement = "background-image-overlay";
      this.replace(deprecated, replacement);
    }
  }

  private warning(deprecated: any) {
    this.logger.log(
      "Deprecated: '" + deprecated + "' was detected and nothing was done."
    );
  }

  private replace(deprecated: any, replacement: any) {
    this.logger.log(
      "Deprecated: '" +
        deprecated +
        "' was detected and replaced with '" +
        replacement +
        "'."
    );
    deprecated.classList.add(replacement);
    deprecated.classList.remove(deprecated);
  }
}
