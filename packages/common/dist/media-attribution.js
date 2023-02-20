/*
  Looks for specially crafted <img> links and will transform its markup to display an attribution overlay on top of the image
  Depends on "_engrid-media-attribution.scss" for styling
  
  Example Image Input
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAQAAABeK7cBAAAADUlEQVR42mO8/5+BAQAGgwHgbKwW2QAAAABJRU5ErkJggg==" data-src="https://via.placeholder.com/300x300" data-attribution-source="© Jane Doe 1">
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAQAAABeK7cBAAAADUlEQVR42mO8/5+BAQAGgwHgbKwW2QAAAABJRU5ErkJggg==" data-src="https://via.placeholder.com/300x300" data-attribution-source="© John Doe 2" data-attribution-source-link="https://www.google.com/">
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAQAAABeK7cBAAAADUlEQVR42mO8/5+BAQAGgwHgbKwW2QAAAABJRU5ErkJggg==" data-src="https://via.placeholder.com/300x300" data-attribution-source="© Max Doe 3" data-attribution-source-link="https://www.google.com/" data-attribution-hide-overlay>

  Example Video Input (Doesn't currently visually display)
  @TODO Video tags are processed but their <figcaption> is not visually displayed. Need to update "_engrid-media-attribution.scss"
  <video poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAQAAABeK7cBAAAADUlEQVR42mO8/5+BAQAGgwHgbKwW2QAAAABJRU5ErkJggg==" data-attribution-source="© Jane Doe 1" data-attribution-source-link="https://www.google.com/"> <source data-src="https://player.vimeo.com/external/123456789.hd.mp4?s=987654321&amp;profile_id=123" type="video/mp4"></video>

  Example Image Output
  <figure class="media-with-attribution"><img src="https://via.placeholder.com/300x300" data-src="https://via.placeholder.com/300x300" data-attribution-source="Jane Doe 1"><figattribution class="attribution-bottomright">Jane Doe 1</figattribution></figure>
*/
import { EngridLogger } from "./";
const tippy = require("tippy.js").default;
export class MediaAttribution {
    constructor() {
        this.logger = new EngridLogger("Media Attribution");
        // Find all images with attribution but not with the "data-attribution-hide-overlay" attribute
        this.mediaWithAttribution = document.querySelectorAll("img[data-attribution-source]:not([data-attribution-hide-overlay]), video[data-attribution-source]:not([data-attribution-hide-overlay])");
        this.mediaWithAttribution.forEach((element) => {
            this.logger.log("The following image was found with data attribution fields on it. It's markup will be changed to add caption support.", element);
            // Creates the wapping <figure> element
            let figure = document.createElement("figure");
            figure.classList.add("media-with-attribution");
            // Moves the <img> inside its <figure> element
            let mediaWithAttributionParent = element.parentNode;
            if (mediaWithAttributionParent) {
                mediaWithAttributionParent.insertBefore(figure, element);
                figure.appendChild(element);
                let mediaWithAttributionElement = element;
                // Append the <figcaption> element after the <img> and conditionally add the Source's Link to it
                let attributionSource = mediaWithAttributionElement.dataset.attributionSource;
                if (attributionSource) {
                    let attributionSourceLink = mediaWithAttributionElement.dataset.attributionSourceLink;
                    if (attributionSourceLink) {
                        mediaWithAttributionElement.insertAdjacentHTML("afterend", '<figattribution><a href="' +
                            decodeURIComponent(attributionSourceLink) +
                            '" target="_blank" tabindex="-1">' +
                            attributionSource +
                            "</a></figure>");
                    }
                    else {
                        mediaWithAttributionElement.insertAdjacentHTML("afterend", "<figattribution>" + attributionSource + "</figure>");
                    }
                    const attributionSourceTooltip = "attributionSourceTooltip" in mediaWithAttributionElement.dataset
                        ? mediaWithAttributionElement.dataset.attributionSourceTooltip
                        : false;
                    if (attributionSourceTooltip) {
                        tippy(".media-with-attribution figattribution", {
                            content: attributionSourceTooltip,
                            arrow: true,
                            arrowType: "default",
                            placement: "left",
                            trigger: "click mouseenter focus",
                            interactive: true,
                        });
                    }
                }
            }
        });
    }
}
