/**
 * This class handles adding a checkbox to a form that, when checked, will display an embedded ecard form.
 * The embedded ecard form is hosted on a separate page and is displayed in an iframe.
 * The form data is saved in session storage and is submitted when the thank you page is loaded.
 * Options can set on the page via window.EngridEmbeddedEcard.
 */
import { EnForm, ENGrid, EngridLogger } from "./";
import {
  EmbeddedEcardOptions,
  EmbeddedEcardOptionsDefaults,
} from "./interfaces/embedded-ecard-options";

export class EmbeddedEcard {
  private logger: EngridLogger = new EngridLogger(
    "Embedded Ecard",
    "#D95D39",
    "#0E1428",
    "📧"
  );
  private readonly options: EmbeddedEcardOptions = EmbeddedEcardOptionsDefaults;
  private _form: EnForm = EnForm.getInstance();

  constructor() {
    // For the page hosting the embedded ecard
    if (this.onHostPage()) {
      // Clean up session variables if the page is reloaded, and it isn't a submission failure
      const submissionFailed = !!(
        ENGrid.checkNested(
          window.EngagingNetworks,
          "require",
          "_defined",
          "enjs",
          "checkSubmissionFailed"
        ) &&
        window.EngagingNetworks.require._defined.enjs.checkSubmissionFailed()
      );
      if (!submissionFailed) {
        sessionStorage.removeItem("engrid-embedded-ecard");
        sessionStorage.removeItem("engrid-send-embedded-ecard");
      }

      this.options = {
        ...EmbeddedEcardOptionsDefaults,
        ...window.EngridEmbeddedEcard,
      };
      const pageUrl = new URL(this.options.pageUrl);
      pageUrl.searchParams.append("data-engrid-embedded-ecard", "true");
      this.options.pageUrl = pageUrl.href;
      this.logger.log("Running Embedded Ecard component", this.options);
      this.embedEcard();
      this.addEventListeners();
    }

    // For the thank you page - after the host page form has been submitted
    // Only runs if eCard was selected on the main page
    if (this.onPostActionPage()) {
      ENGrid.setBodyData("embedded-ecard-sent", "true");
      this.submitEcard();
    }

    // For the page that is embedded
    if (this.onEmbeddedEcardPage()) {
      this.setupEmbeddedPage();
    }
  }

  private onHostPage(): boolean {
    return (
      window.hasOwnProperty("EngridEmbeddedEcard") &&
      typeof window.EngridEmbeddedEcard === "object" &&
      window.EngridEmbeddedEcard.hasOwnProperty("pageUrl") &&
      window.EngridEmbeddedEcard.pageUrl !== ""
    );
  }

  private onEmbeddedEcardPage(): boolean {
    return ENGrid.getPageType() === "ECARD" && ENGrid.hasBodyData("embedded");
  }

  private onPostActionPage(): boolean {
    return (
      sessionStorage.getItem("engrid-embedded-ecard") !== null &&
      sessionStorage.getItem("engrid-send-embedded-ecard") !== null &&
      !this.onHostPage() &&
      !this.onEmbeddedEcardPage()
    );
  }

  private embedEcard() {
    const container = document.createElement("div");
    container.classList.add("engrid--embedded-ecard");

    const heading = document.createElement("h3");
    heading.textContent = this.options.headerText;
    heading.classList.add("engrid--embedded-ecard-heading");
    container.appendChild(heading);

    const checkbox = document.createElement("div");
    checkbox.classList.add(
      "pseudo-en-field",
      "en__field",
      "en__field--checkbox",
      "en__field--000000",
      "en__field--embedded-ecard"
    );
    checkbox.innerHTML = `
      <div class="en__field__element en__field__element--checkbox">
        <div class="en__field__item">
          <input class="en__field__input en__field__input--checkbox" id="en__field_embedded-ecard" name="engrid.embedded-ecard" type="checkbox" value="Y">
          <label class="en__field__label en__field__label--item" for="en__field_embedded-ecard">${this.options.checkboxText}</label>
        </div>
      </div>`;
    container.appendChild(checkbox);

    container.appendChild(this.createIframe(this.options.pageUrl));

    document
      .querySelector(this.options.anchor)
      ?.insertAdjacentElement(
        this.options.placement as InsertPosition,
        container
      );
  }

  private createIframe(url: string): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.setAttribute("src", url);
    iframe.setAttribute("width", "100%");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    iframe.classList.add("engrid-iframe", "engrid-iframe--embedded-ecard");
    iframe.style.display = "none";
    return iframe;
  }

  private addEventListeners() {
    const iframe = document.querySelector(
      ".engrid-iframe--embedded-ecard"
    ) as HTMLIFrameElement;

    const sendEcardCheckbox = document.getElementById(
      "en__field_embedded-ecard"
    ) as HTMLInputElement;

    // Initialize based on checkbox's default state
    if (sendEcardCheckbox?.checked) {
      iframe?.setAttribute("style", "display: block");
      sessionStorage.setItem("engrid-send-embedded-ecard", "true");
    } else {
      iframe?.setAttribute("style", "display: none");
      sessionStorage.removeItem("engrid-send-embedded-ecard");
    }

    sendEcardCheckbox?.addEventListener("change", (e) => {
      const checkbox = e.target as HTMLInputElement;
      if (checkbox?.checked) {
        iframe?.setAttribute("style", "display: block");
        sessionStorage.setItem("engrid-send-embedded-ecard", "true");
      } else {
        iframe?.setAttribute("style", "display: none");
        sessionStorage.removeItem("engrid-send-embedded-ecard");
      }
    });
  }

  private setupEmbeddedPage() {
    let ecardVariant = document.querySelector(
      "[name='friend.ecard']"
    ) as HTMLInputElement;
    let ecardSendDate = document.querySelector(
      "[name='ecard.schedule']"
    ) as HTMLInputElement;
    let ecardMessage = document.querySelector(
      "[name='transaction.comments']"
    ) as HTMLInputElement;
    let recipientName = document.querySelector(
      ".en__ecardrecipients__name > input"
    ) as HTMLInputElement;
    let recipientEmail = document.querySelector(
      ".en__ecardrecipients__email > input"
    ) as HTMLInputElement;

    [
      ecardVariant,
      ecardSendDate,
      ecardMessage,
      recipientName,
      recipientEmail,
    ].forEach((el) => {
      el.addEventListener("input", () => {
        //add "chain" param to window.location.href if it doesnt have it
        const pageUrl = new URL(window.location.href);
        if (!pageUrl.searchParams.has("chain")) {
          pageUrl.searchParams.append("chain", "");
        }

        sessionStorage.setItem(
          "engrid-embedded-ecard",
          JSON.stringify({
            pageUrl: pageUrl.href,
            formData: {
              ecardVariant: ecardVariant?.value || "",
              ecardSendDate: ecardSendDate?.value || "",
              ecardMessage: ecardMessage?.value || "",
              recipientName: recipientName?.value || "",
              recipientEmail: recipientEmail?.value || "",
            },
          })
        );
      });
    });

    document.querySelectorAll(".en__ecarditems__thumb").forEach((el) => {
      // Making sure the session value is changed when this is clicked
      el.addEventListener("click", () => {
        ecardVariant.dispatchEvent(new Event("input"));
      });
    });

    window.addEventListener("message", (e) => {
      if (e.origin !== location.origin || !e.data.action) return;

      this.logger.log("Received post message", e.data);

      switch (e.data.action) {
        case "submit_form":
          let embeddedEcardData = JSON.parse(
            sessionStorage.getItem("engrid-embedded-ecard") || "{}"
          );

          if (ecardVariant) {
            ecardVariant.value = embeddedEcardData.formData["ecardVariant"];
          }
          if (ecardSendDate) {
            ecardSendDate.value = embeddedEcardData.formData["ecardSendDate"];
          }
          if (ecardMessage) {
            ecardMessage.value = embeddedEcardData.formData["ecardMessage"];
          }

          recipientName.value = embeddedEcardData.formData["recipientName"];
          recipientEmail.value = embeddedEcardData.formData["recipientEmail"];

          const addRecipientButton = document.querySelector(
            ".en__ecarditems__addrecipient"
          ) as HTMLButtonElement;
          addRecipientButton?.click();

          const form = EnForm.getInstance();
          form.submitForm();

          sessionStorage.removeItem("engrid-embedded-ecard");
          sessionStorage.removeItem("engrid-send-embedded-ecard");
          break;
        case "set_recipient":
          recipientName.value = e.data.name;
          recipientEmail.value = e.data.email;
          recipientName.dispatchEvent(new Event("input"));
          recipientEmail.dispatchEvent(new Event("input"));
          break;
      }
    });

    this.sendPostMessage("parent", "ecard_form_ready");
  }

  private submitEcard() {
    const embeddedEcardData = JSON.parse(
      sessionStorage.getItem("engrid-embedded-ecard") || "{}"
    );
    this.logger.log("Submitting ecard", embeddedEcardData);

    const iframe = this.createIframe(embeddedEcardData.pageUrl);
    document.querySelector(".body-main")?.appendChild(iframe);

    window.addEventListener("message", (e) => {
      if (e.origin !== location.origin || !e.data.action) return;

      if (e.data.action === "ecard_form_ready") {
        this.sendPostMessage(iframe, "submit_form");
      }
    });
  }

  private sendPostMessage(
    target: HTMLIFrameElement | "parent",
    action: string,
    data: object = {}
  ) {
    const message = {
      action,
      ...data,
    };

    if (target === "parent") {
      window.parent.postMessage(message, location.origin);
    } else {
      target.contentWindow?.postMessage(message, location.origin);
    }
  }
}
