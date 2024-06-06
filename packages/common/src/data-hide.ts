// Hides elements based on URL arguments.
//
// The DataHide class is used to hide elements based on URL arguments.
// It retrieves the elements to hide from the URL arguments and hides them.
// If no elements are found, the constructor returns early.
// Otherwise, it logs the found elements and hides them.

import { ENGrid, EngridLogger } from "./";

export class DataHide {
  private logger: EngridLogger = new EngridLogger(
    "DataHide",
    "#333333",
    "#f0f0f0",
    "🙈"
  );
  private enElements = new Array<Object>();

  constructor() {
    this.logger.log("Constructor");
    this.enElements = ENGrid.getUrlParameter("engrid_hide[]") as Array<Object>;
    if (!this.enElements || this.enElements.length === 0) {
      this.logger.log("No Elements Found");
      return;
    }
    this.logger.log("Elements Found:", this.enElements);
    this.hideAll();
  }

  /**
   * Hides all the elements based on the URL arguments.
   */
  hideAll() {
    this.enElements.forEach((element) => {
      const item = Object.keys(element)[0];
      const type = Object.values(element)[0];
      this.hideItem(item, type);
    });
    return;
  }

  /**
   * Hides a specific element based on the item and type.
   * @param item - The item to hide (ID or class name).
   * @param type - The type of the item (either "id" or "class").
   */
  hideItem(item: string, type: "id" | "class") {
    const regEx = /engrid_hide\[([\w-]+)\]/g;
    const itemData = [...item.matchAll(regEx)].map((match) => match[1])[0];
    switch (type) {
      case "id":
        const element = document.getElementById(itemData);
        if (element) {
          this.logger.log("Hiding By ID", itemData, element);
          element.setAttribute("hidden-via-url-argument", "");
        } else {
          this.logger.error("Element Not Found By ID", itemData);
        }
        break;
      case "class":
      default:
        const elements = document.getElementsByClassName(itemData);
        if (elements.length > 0) {
          for (let i = 0; i < elements.length; i++) {
            this.logger.log("Hiding By Class", itemData, elements[i]);
            elements[i].setAttribute("hidden-via-url-argument", "");
          }
        } else {
          this.logger.log("No Elements Found By Class", itemData);
        }
        break;
    }
  }
}
