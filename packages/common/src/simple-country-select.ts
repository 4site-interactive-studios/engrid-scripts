// This class works when the user has added ".simple_country_select" as a class in page builder for the Country select
import * as cookie from "./cookie";
import { ENGrid } from ".";
export class SimpleCountrySelect {
  public countryWrapper: HTMLDivElement = document.querySelector(
    ".simple_country_select"
  ) as HTMLDivElement;
  public countrySelect: HTMLSelectElement = document.querySelector(
    "select#en__field_supporter_country"
  ) as HTMLSelectElement;

  private country = null;
  constructor() {
    const engridAutofill = cookie.get("engrid-autofill");
    const submissionFailed = !!(
      ENGrid.checkNested(
        window.EngagingNetworks,
        "require",
        "_defined",
        "enjs",
        "checkSubmissionFailed"
      ) && window.EngagingNetworks.require._defined.enjs.checkSubmissionFailed()
    );
    const hasIntlSupport = !!ENGrid.checkNested(window.Intl, "DisplayNames");
    // Only run if there's no engrid-autofill cookie && if it has Intl support
    if (!engridAutofill && !submissionFailed && hasIntlSupport) {
      fetch(`https://${window.location.hostname}/cdn-cgi/trace`)
        .then((res) => res.text())
        .then((t) => {
          let data = t.replace(/[\r\n]+/g, '","').replace(/\=+/g, '":"');
          data = '{"' + data.slice(0, data.lastIndexOf('","')) + '"}';
          const jsondata = JSON.parse(data);
          this.country = jsondata.loc;
          this.init();
        });
    } else {
      this.init();
    }
  }

  private init() {
    if (this.countrySelect) {
      if (this.country) {
        const countriesNames = new (Intl as any).DisplayNames(["en"], {
          type: "region",
        });
        // We are setting the country by Name because the ISO code is not always the same. They have 2 and 3 letter codes.
        this.setCountryByName(countriesNames.of(this.country));
      }
      let countrySelectValue =
        this.countrySelect.options[this.countrySelect.selectedIndex].value;

      // @TODO Update so that it reads "(Outside X?)" where X is the Value of the Country Select. No need for long form version of it.
      if (
        countrySelectValue.toUpperCase() == "US" ||
        countrySelectValue.toUpperCase() == "USA" ||
        countrySelectValue.toUpperCase() == "UNITED STATES"
      ) {
        countrySelectValue = "the US";
      }

      let countryWrapper = document.querySelector(".simple_country_select");

      if (countryWrapper) {
        // Remove Country Select tab index
        this.countrySelect.tabIndex = -1;

        // Find the address label
        let addressLabel: HTMLLabelElement = document.querySelector(
          ".en__field--address1 label"
        ) as HTMLLabelElement;

        // EN does not enforce a labels on fields so we have to check for it
        // @TODO Update so that this follows the same pattern / HTML structure as the Tippy tooltips which are added to labels. REF: https://github.com/4site-interactive-studios/engrid-aiusa/blob/6e4692d4f9a28b9668d6c1bfed5622ac0cc5bdb9/src/scripts/main.js#L42
        if (addressLabel) {
          let labelText = addressLabel.innerHTML;

          // Add our link INSIDE the address label
          let newEl = document.createElement("span");
          newEl.innerHTML =
            '<label class="engrid-simple-country"><a href="javascript:void(0)">(Outside ' +
            countrySelectValue +
            "?)</a></label>";
          addressLabel.innerHTML = `${labelText}${newEl.innerHTML}`;
          addressLabel.addEventListener("click", (ev) => {
            ev.preventDefault();
            if ((ev.target as HTMLElement)?.tagName === "A") {
              this.showCountrySelect(ev);
            }
          });
        }
      }
      // Deal with the auto-fill for the country
      this.countrySelect.addEventListener("change", this.writeLink.bind(this));
    }
  }

  public showCountrySelect(e: Event) {
    e.preventDefault();
    this.countryWrapper.classList.add("country-select-visible");
    let addressLabel: HTMLLabelElement = document.querySelector(
      ".en__field--address1 label"
    ) as HTMLLabelElement;
    let addressWrapper: HTMLDivElement = addressLabel.parentElement
      ?.parentElement as HTMLDivElement;
    addressWrapper.classList.add("country-select-visible");
    this.countrySelect.focus();

    // Reinstate Country Select tab index
    this.countrySelect.removeAttribute("tabIndex");
  }
  private writeLink() {
    let countryName =
      this.countrySelect.options[this.countrySelect.selectedIndex].value;
    let addressLabel: HTMLLabelElement = document.querySelector(
      ".engrid-simple-country"
    ) as HTMLLabelElement;
    if (addressLabel) {
      let labelLink = `<a href="javascript:void(0)">(Outside ${countryName}?)</a>`;
      addressLabel.innerHTML = labelLink;
    }
  }

  private setCountryByName(countryName: string) {
    if (this.countrySelect) {
      let countrySelectOptions = this.countrySelect.options;
      for (let i = 0; i < countrySelectOptions.length; i++) {
        if (
          countrySelectOptions[i].innerHTML.toLowerCase() ==
          countryName.toLowerCase()
        ) {
          this.countrySelect.selectedIndex = i;
          break;
        }
      }
      const event = new Event("change", { bubbles: true });
      this.countrySelect.dispatchEvent(event);
    }
  }
}
