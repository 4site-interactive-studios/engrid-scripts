import { ENGrid } from "./engrid";
import { EngridLogger } from "./";
export class PageBackground {
    constructor() {
        this.logger = new EngridLogger("Page Background");
        // @TODO: Change page-backgroundImage to page-background
        this.pageBackground = document.querySelector(".page-backgroundImage");
        // Finds any <img> added to the "backgroundImage" ENGRid section and sets it as the "--engrid__page-backgroundImage_url" CSS Custom Property
        if (this.pageBackground) {
            const pageBackgroundImg = this.pageBackground.querySelector("img");
            let pageBackgroundImgDataSrc = pageBackgroundImg === null || pageBackgroundImg === void 0 ? void 0 : pageBackgroundImg.getAttribute("data-src");
            let pageBackgroundImgSrc = pageBackgroundImg === null || pageBackgroundImg === void 0 ? void 0 : pageBackgroundImg.src;
            if (this.pageBackground && pageBackgroundImgDataSrc) {
                this.logger.log("A background image set in the page was found with a data-src value, setting it as --engrid__page-backgroundImage_url", pageBackgroundImgDataSrc);
                pageBackgroundImgDataSrc = "url('" + pageBackgroundImgDataSrc + "')";
                this.pageBackground.style.setProperty("--engrid__page-backgroundImage_url", pageBackgroundImgDataSrc);
            }
            else if (this.pageBackground && pageBackgroundImgSrc) {
                this.logger.log("A background image set in the page was found with a src value, setting it as --engrid__page-backgroundImage_url", pageBackgroundImgSrc);
                pageBackgroundImgSrc = "url('" + pageBackgroundImgSrc + "')";
                this.pageBackground.style.setProperty("--engrid__page-backgroundImage_url", pageBackgroundImgSrc);
            }
            else if (pageBackgroundImg) {
                this.logger.log("A background image set in the page was found but without a data-src or src value, no action taken", pageBackgroundImg);
            }
            else {
                this.logger.log("A background image set in the page was not found, any default image set in the theme on --engrid__page-backgroundImage_url will be used");
            }
        }
        else {
            this.logger.log("A background image set in the page was not found, any default image set in the theme on --engrid__page-backgroundImage_url will be used");
        }
        this.setDataAttributes();
    }
    setDataAttributes() {
        if (this.hasVideoBackground())
            return ENGrid.setBodyData("page-background", "video");
        if (this.hasImageBackground())
            return ENGrid.setBodyData("page-background", "image");
        return ENGrid.setBodyData("page-background", "empty");
    }
    hasVideoBackground() {
        if (this.pageBackground) {
            return !!this.pageBackground.querySelector("video");
        }
    }
    hasImageBackground() {
        if (this.pageBackground) {
            return (!this.hasVideoBackground() && !!this.pageBackground.querySelector("img"));
        }
    }
}
