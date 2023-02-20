import { ENGrid, EngridLogger } from "./";
import { EnForm } from "./events";

export class iFrame {
  public _form: EnForm = EnForm.getInstance();
  private logger: EngridLogger = new EngridLogger(
    "iFrame",
    "brown",
    "gray",
    "📡"
  );

  constructor() {
    if (this.inIframe()) {
      // Check if the iFrame tag has the "force-full-view" data attribute
      if (this.hasForceFullView()) {
        document.body.removeAttribute("data-engrid-embedded"); // Remove the "data-engrid-embedded" data attribute from the EN page and force it's visiblity
        document.body.style.visibility = "visible"; // Force visiblity
        this.logger.log(
          "Parent iFrame detected with'force-full-view' data attribute, removing 'data-engrid-embedded' from the 'body' in the event it was added from inline scripts."
        );
      } else {
        ENGrid.setBodyData("embedded", ""); // Add the data-engrid-embedded attribute when inside an iFrame
        this.logger.log(
          "Detected running in an iFrame, added 'data-engrid-embedded' to the 'body'."
        );
      }
      this.logger.log("Begin Resizing");
      this.sendIframeHeight(); // Fire the resize event immediately
      window.addEventListener("resize", this.sendIframeHeight.bind(this)); // Listen for the resize event
      window.addEventListener("load", (event) => {
        // Scroll to top of iFrame
        this.logger.log("window.onload");
        this.sendIframeHeight();
        window.parent.postMessage(
          {
            scroll: this.shouldScroll(),
          },
          "*"
        );

        // On click fire the resize event
        document.addEventListener("click", (e: Event) => {
          this.logger.log("click");
          setTimeout(() => {
            this.sendIframeHeight();
          }, 100);
        });
      });
      // Listen for the form submit event
      this._form.onSubmit.subscribe((e) => {
        this.logger.log("onSubmit");
        this.sendIframeFormStatus("submit");
      });
      // If the iFrame is Chained, check if the form has data
      if (this.isChained() && this.hasPayment()) {
        this.logger.log("Chained iFrame");
        this.sendIframeFormStatus("chained");
        this.hideFormComponents();
        this.addChainedBanner();
      }

      // Remove the skip link markup when inside an iFrame
      const skipLink = document.querySelector(".skip-link");
      if (skipLink) {
        skipLink.remove();
      }
    } else {
      // Parent Page Logic
      window.addEventListener("message", (event) => {
        const iframe = this.getIFrameByEvent(event) as HTMLIFrameElement;
        if (iframe) {
          if (event.data.hasOwnProperty("frameHeight")) {
            iframe.style.height = event.data.frameHeight + "px";
          } else if (
            event.data.hasOwnProperty("scroll") &&
            event.data.scroll > 0
          ) {
            const elDistanceToTop =
              window.pageYOffset + iframe.getBoundingClientRect().top;
            let scrollTo = elDistanceToTop + event.data.scroll;
            window.scrollTo({
              top: scrollTo,
              left: 0,
              behavior: "smooth",
            });
            this.logger.log("Scrolling Window to " + scrollTo);
          }
        }
      });
    }
  }

  private sendIframeHeight() {
    let height = document.body.offsetHeight;
    this.logger.log("Sending iFrame height of: " + height + "px"); // check the message is being sent correctly
    window.parent.postMessage(
      {
        frameHeight: height,
        pageNumber: ENGrid.getPageNumber(),
        pageCount: ENGrid.getPageCount(),
        giftProcess: ENGrid.getGiftProcess(),
      },
      "*"
    );
  }
  private sendIframeFormStatus(status: string) {
    window.parent.postMessage(
      {
        status: status,
        pageNumber: ENGrid.getPageNumber(),
        pageCount: ENGrid.getPageCount(),
        giftProcess: ENGrid.getGiftProcess(),
      },
      "*"
    );
  }
  private getIFrameByEvent(event: MessageEvent) {
    return [].slice
      .call(document.getElementsByTagName("iframe"))
      .filter((iframe: HTMLIFrameElement) => {
        return iframe.contentWindow === event.source;
      })[0];
  }
  private shouldScroll() {
    // If you find a error, scroll
    if (document.querySelector(".en__errorHeader")) {
      return true;
    }
    // If it's a chained iFrame, don't scroll
    if (this.isChained()) {
      return false;
    }
    // Try to match the iframe referrer URL by testing valid EN Page URLs
    let referrer = document.referrer;
    let enURLPattern = new RegExp(/^(.*)\/(page)\/(\d+.*)/);

    // Scroll if the Regex matches, don't scroll otherwise
    return enURLPattern.test(referrer);
  }
  private inIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
  private hasForceFullView() {
    try {
      if (window.frameElement) {
        return window.frameElement.hasAttribute("force-full-view");
      }
    } catch (e) {
      return true;
    }
  }
  private isChained() {
    return !!ENGrid.getUrlParameter("chain");
  }
  private hasPayment() {
    const payment = ENGrid.getFieldValue("transaction.paymenttype");
    const ccnumber = ENGrid.getFieldValue("transaction.ccnumber");
    return payment || ccnumber;
  }
  private hideFormComponents() {
    this.logger.log("Hiding Form Components");
    const en__component = document.querySelectorAll(
      ".body-main > div"
    ) as NodeListOf<HTMLDivElement>;
    en__component.forEach((component, index) => {
      if (
        component.classList.contains("hide") === false &&
        component.classList.contains("hide-iframe") === false &&
        component.classList.contains("radio-to-buttons_donationAmt") ===
          false &&
        index < en__component.length - 1
      ) {
        component.classList.add("hide-iframe");
        component.classList.add("hide-chained");
      }
    });
    this.sendIframeHeight();
  }
  private showFormComponents() {
    this.logger.log("Showing Form Components");
    const en__component = document.querySelectorAll(
      ".body-main > div.hide-chained"
    ) as NodeListOf<HTMLDivElement>;
    en__component.forEach((component) => {
      component.classList.remove("hide-iframe");
      component.classList.remove("hide-chained");
    });
    this.sendIframeHeight();
  }
  private addChainedBanner() {
    this.logger.log("Adding Chained Banner");
    const banner = document.createElement("div");
    const lastComponent = document.querySelector(
      ".body-main > div:last-of-type"
    ) as HTMLDivElement;
    banner.classList.add("en__component");
    banner.classList.add("en__component--banner");
    banner.classList.add("en__component--banner--chained");
    banner.innerHTML = `<div class="en__component__content"><div class="en__component__content__inner"><div class="en__component__content__text"><p>
      Giving as <strong>${ENGrid.getFieldValue(
        "supporter.firstName"
      )} ${ENGrid.getFieldValue("supporter.lastName")}</strong> 
      with <strong>${ENGrid.getFieldValue(
        "transaction.paymenttype"
      ).toUpperCase()}</strong>
      (<a href="#" class="en__component__content__link">change</a>)</p></div></div></div>`;
    lastComponent?.parentNode?.insertBefore(banner, lastComponent);
    banner
      .querySelector(".en__component__content__link")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.showFormComponents();
        banner.remove();
      });
  }
}
