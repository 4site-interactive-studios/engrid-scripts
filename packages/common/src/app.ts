import {
  DonationAmount,
  DonationFrequency,
  EnForm,
  ProcessingFees,
} from "./events";
import {
  AmountLabel,
  Loader,
  ProgressBar,
  UpsellLightbox,
  ENGrid,
  Options,
  OptionsDefaults,
  setRecurrFreq,
  PageBackground,
  MediaAttribution,
  ApplePay,
  A11y,
  CapitalizeFields,
  CreditCardNumbers,
  Ecard,
  ClickToExpand,
  legacy,
  LiveVariables,
  iFrame,
  ShowHideRadioCheckboxes,
  SimpleCountrySelect,
  SkipToMainContentLink,
  SrcDefer,
  NeverBounce,
  AutoYear,
  Autocomplete,
  RememberMe,
  TranslateFields,
  ShowIfAmount,
  EngridLogger,
  OtherAmount,
  MinMaxAmount,
  Ticker,
  DataReplace,
  DataHide,
  AddNameToMessage,
  ExpandRegionName,
  AppVersion,
  UrlToForm,
  RequiredIfVisible,
  TidyContact,
  DataLayer,
  LiveCurrency,
  Autosubmit,
} from "./";

export class App extends ENGrid {
  // Events
  private _form: EnForm = EnForm.getInstance();
  private _fees: ProcessingFees = ProcessingFees.getInstance();
  private _amount: DonationAmount = DonationAmount.getInstance(
    "transaction.donationAmt",
    "transaction.donationAmt.other"
  );
  private _frequency: DonationFrequency = DonationFrequency.getInstance();

  private options: Options;

  private logger = new EngridLogger("App", "black", "white", "🍏");

  constructor(options: Options) {
    super();
    const loader = new Loader();
    this.options = { ...OptionsDefaults, ...options };
    // Add Options to window
    window.EngridOptions = this.options;
    if (loader.reload()) return;
    // Turn Debug ON if you use local assets
    if (
      ENGrid.getBodyData("assets") === "local" &&
      ENGrid.getUrlParameter("debug") !== "false"
    ) {
      window.EngridOptions.Debug = true;
    }

    // Document Load
    if (document.readyState !== "loading") {
      this.run();
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        this.run();
      });
    }
    // Window Load
    let onLoad = typeof window.onload === "function" ? window.onload : null;
    window.onload = (e: Event) => {
      this.onLoad();
      if (onLoad) {
        onLoad.bind(window, e);
      }
    };
    // Window Resize
    window.onresize = () => {
      this.onResize();
    };
  }

  private run() {
    if (
      !ENGrid.checkNested(
        window.EngagingNetworks,
        "require",
        "_defined",
        "enjs"
      )
    ) {
      this.logger.danger("Engaging Networks JS Framework NOT FOUND");
      setTimeout(() => {
        this.run();
      }, 10);
      return;
    }
    // If there's an option object on the page, override the defaults
    if (window.hasOwnProperty("EngridPageOptions")) {
      this.options = { ...this.options, ...window.EngridPageOptions };
      // Add Options to window
      window.EngridOptions = this.options;
    }

    if (this.options.Debug || App.getUrlParameter("debug") == "true")
      // Enable debug if available is the first thing
      App.setBodyData("debug", "");

    // TODO: Abstract everything to the App class so we can remove custom-methods
    legacy.inputPlaceholder();
    legacy.preventAutocomplete();
    legacy.watchInmemField();
    legacy.watchGiveBySelectField();
    legacy.simpleUnsubscribe();

    legacy.contactDetailLabels();
    legacy.easyEdit();
    legacy.enInput.init();

    new ShowHideRadioCheckboxes("transaction.giveBySelect", "giveBySelect-");
    new ShowHideRadioCheckboxes("transaction.inmem", "inmem-");
    new ShowHideRadioCheckboxes("transaction.recurrpay", "recurrpay-");

    // Automatically show/hide all radios
    let radioFields: string[] = [];
    const allRadios: NodeListOf<HTMLInputElement> =
      document.querySelectorAll("input[type=radio]");
    allRadios.forEach((radio) => {
      if ("name" in radio && radioFields.includes(radio.name) === false) {
        radioFields.push(radio.name);
      }
    });
    radioFields.forEach((field) => {
      new ShowHideRadioCheckboxes(
        field,
        "engrid__" + field.replace(/\./g, "") + "-"
      );
    });

    // Automatically show/hide all checkboxes
    const allCheckboxes: NodeListOf<HTMLInputElement> =
      document.querySelectorAll("input[type=checkbox]");
    allCheckboxes.forEach((checkbox) => {
      if ("name" in checkbox) {
        new ShowHideRadioCheckboxes(
          checkbox.name,
          "engrid__" + checkbox.name.replace(/\./g, "") + "-"
        );
      }
    });

    // Controls if the Theme has a the "Debug Bar"
    // legacy.debugBar();

    // Client onSubmit and onError functions
    this._form.onSubmit.subscribe(() => this.onSubmit());
    this._form.onError.subscribe(() => this.onError());
    this._form.onValidate.subscribe(() => this.onValidate());

    // Event Listener Examples
    this._amount.onAmountChange.subscribe((s) =>
      this.logger.success(`Live Amount: ${s}`)
    );
    this._frequency.onFrequencyChange.subscribe((s) => {
      this.logger.success(`Live Frequency: ${s}`);
      setTimeout(() => {
        this._amount.load();
      }, 150);
    });
    this._form.onSubmit.subscribe((s) =>
      this.logger.success("Submit: " + JSON.stringify(s))
    );
    this._form.onError.subscribe((s) =>
      this.logger.danger("Error: " + JSON.stringify(s))
    );

    window.enOnSubmit = () => {
      this._form.submit = true;
      this._form.submitPromise = false;
      this._form.dispatchSubmit();
      if (!this._form.submit) return false;
      if (this._form.submitPromise) return this._form.submitPromise;
      this.logger.success("enOnSubmit Success");
      return true;
    };
    window.enOnError = () => {
      this._form.dispatchError();
    };
    window.enOnValidate = () => {
      this._form.validate = true;
      this._form.validatePromise = false;
      this._form.dispatchValidate();
      if (!this._form.validate) return false;
      if (this._form.validatePromise) return this._form.validatePromise;
      this.logger.success("Validation Passed");
      return true;
    };

    // Live Currency
    new LiveCurrency();

    // iFrame Logic
    new iFrame();

    // Live Variables
    new LiveVariables(this.options);

    // Dynamically set Recurrency Frequency
    new setRecurrFreq();

    // Upsell Lightbox
    new UpsellLightbox();

    // Amount Labels
    new AmountLabel();

    // Engrid Data Replacement
    new DataReplace();

    // ENgrid Hide Script
    new DataHide();

    // Autosubmit script
    new Autosubmit();

    // On the end of the script, after all subscribers defined, let's load the current value
    this._amount.load();
    this._frequency.load();

    // Simple Country Select
    new SimpleCountrySelect();
    // Add Image Attribution
    if (this.options.MediaAttribution) new MediaAttribution();
    // Apple Pay
    if (this.options.applePay) new ApplePay();
    // Capitalize Fields
    if (this.options.CapitalizeFields) new CapitalizeFields();
    // Auto Year Class
    if (this.options.AutoYear) new AutoYear();
    // Credit Card Numbers Only
    new CreditCardNumbers();
    // Autocomplete Class
    new Autocomplete();
    // Ecard Class
    new Ecard();
    // Click To Expand
    if (this.options.ClickToExpand) new ClickToExpand();
    if (this.options.SkipToMainContentLink) new SkipToMainContentLink();
    if (this.options.SrcDefer) new SrcDefer();
    // Progress Bar
    if (this.options.ProgressBar) new ProgressBar();

    // RememberMe
    if (this.options.RememberMe && typeof this.options.RememberMe === "object")
      new RememberMe(this.options.RememberMe);

    if (this.options.NeverBounceAPI)
      new NeverBounce(
        this.options.NeverBounceAPI,
        this.options.NeverBounceDateField,
        this.options.NeverBounceStatusField,
        this.options.NeverBounceDateFormat
      );

    new ShowIfAmount();

    new OtherAmount();

    new MinMaxAmount();

    new Ticker();
    new A11y();

    new AddNameToMessage();
    new ExpandRegionName();

    // Page Background
    new PageBackground();

    // Url Params to Form Fields
    new UrlToForm();

    // Required if Visible Fields
    new RequiredIfVisible();

    // TidyContact
    if (this.options.TidyContact) new TidyContact();

    // Translate Fields
    if (this.options.TranslateFields) new TranslateFields();

    // Data Layer Events
    new DataLayer();

    this.setDataAttributes();

    ENGrid.setBodyData("data-engrid-scripts-js-loading", "finished");

    window.EngridVersion = AppVersion;
    this.logger.success(`VERSION: ${AppVersion}`);
  }

  private onLoad() {
    if (this.options.onLoad) {
      this.logger.log("onLoad Triggered");
      this.options.onLoad();
    }
  }

  private onResize() {
    if (this.options.onResize) {
      this.logger.log("onResize Triggered");
      this.options.onResize();
    }
  }

  private onValidate() {
    if (this.options.onValidate) {
      this.logger.log("onValidate Triggered");
      this.options.onValidate();
    }
  }

  private onSubmit() {
    if (this.options.onSubmit) {
      this.logger.log("onSubmit Triggered");
      this.options.onSubmit();
    }
  }

  private onError() {
    if (this.options.onError) {
      this.logger.danger("onError Triggered");
      this.options.onError();
    }
  }

  // Use this function to add any Data Attributes to the Body tag
  setDataAttributes() {
    // Add the Page Type as a Data Attribute on the Body Tag
    if (ENGrid.checkNested(window, "pageJson", "pageType")) {
      App.setBodyData("page-type", window.pageJson.pageType);
      this.logger.log("Page Type: " + window.pageJson.pageType);
    } else {
      this.logger.log("Page Type: Not Found");
    }

    // Add the currency code as a Data Attribute on the Body Tag
    App.setBodyData("currency-code", App.getCurrencyCode());

    // Add a body banner data attribute if the banner contains no image or video
    if (!document.querySelector(".body-banner img, .body-banner video")) {
      App.setBodyData("body-banner", "empty");
    }

    // Add a page-alert data attribute if it is empty
    if (!document.querySelector(".page-alert *")) {
      App.setBodyData("no-page-alert", "");
    }

    // Add a content-header data attribute if it is empty
    if (!document.querySelector(".content-header *")) {
      App.setBodyData("no-content-header", "");
    }

    // Add a body-headerOutside data attribute if it is empty
    if (!document.querySelector(".body-headerOutside *")) {
      App.setBodyData("no-body-headerOutside", "");
    }

    // Add a body-header data attribute if it is empty
    if (!document.querySelector(".body-header *")) {
      App.setBodyData("no-body-header", "");
    }

    // Add a body-title data attribute if it is empty
    if (!document.querySelector(".body-title *")) {
      App.setBodyData("no-body-title", "");
    }

    // Add a body-banner data attribute if it is empty
    if (!document.querySelector(".body-banner *")) {
      App.setBodyData("no-body-banner", "");
    }

    // Add a body-bannerOverlay data attribute if it is empty
    if (!document.querySelector(".body-bannerOverlay *")) {
      App.setBodyData("no-body-bannerOverlay", "");
    }

    // Add a body-top data attribute if it is empty
    if (!document.querySelector(".body-top *")) {
      App.setBodyData("no-body-top", "");
    }

    // Add a body-main data attribute if it is empty
    if (!document.querySelector(".body-main *")) {
      App.setBodyData("no-body-main", "");
    }

    // Add a body-bottom data attribute if it is empty
    if (!document.querySelector(".body-bottom *")) {
      App.setBodyData("no-body-bottom", "");
    }

    // Add a body-footer data attribute if it is empty
    if (!document.querySelector(".body-footer *")) {
      App.setBodyData("no-body-footer", "");
    }

    // Add a body-footerOutside data attribute if it is empty
    if (!document.querySelector(".body-footerOutside *")) {
      App.setBodyData("no-body-footerOutside", "");
    }

    // Add a content-footerSpacer data attribute if it is empty
    if (!document.querySelector(".content-footerSpacer *")) {
      App.setBodyData("no-content-footerSpacer", "");
    }

    // Add a content-preFooter data attribute if it is empty
    if (!document.querySelector(".content-preFooter *")) {
      App.setBodyData("no-content-preFooter", "");
    }

    // Add a content-footer data attribute if it is empty
    if (!document.querySelector(".content-footer *")) {
      App.setBodyData("no-content-footer", "");
    }

    // Add a page-backgroundImage banner data attribute if the page background image contains no image or video
    if (
      !document.querySelector(
        ".page-backgroundImage img, .page-backgroundImage video"
      )
    ) {
      App.setBodyData("no-page-backgroundImage", "");
    }

    // Add a page-backgroundImageOverlay data attribute if it is empty
    if (!document.querySelector(".page-backgroundImageOverlay *")) {
      App.setBodyData("no-page-backgroundImageOverlay", "");
    }

    // Add a page-customCode data attribute if it is empty
    if (!document.querySelector(".page-customCode *")) {
      App.setBodyData("no-page-customCode", "");
    }

    // Add a country data attribute
    const countrySelect: HTMLSelectElement = document.querySelector(
      "#en__field_supporter_country"
    ) as HTMLSelectElement;

    if (countrySelect) {
      App.setBodyData("country", countrySelect.value);
      countrySelect.addEventListener("change", () => {
        App.setBodyData("country", countrySelect.value);
      });
    }
    const otherAmountDiv = document.querySelector(
      ".en__field--donationAmt .en__field__item--other"
    );
    if (otherAmountDiv) {
      otherAmountDiv.setAttribute(
        "data-currency-symbol",
        App.getCurrencySymbol()
      );
    }
    // Add a payment type data attribute
    const paymentTypeSelect = App.getField(
      "transaction.paymenttype"
    ) as HTMLSelectElement;
    if (paymentTypeSelect) {
      App.setBodyData("payment-type", paymentTypeSelect.value);
      paymentTypeSelect.addEventListener("change", () => {
        App.setBodyData("payment-type", paymentTypeSelect.value);
      });
    }
    // Add demo data attribute
    if (App.demo) App.setBodyData("demo", "");
  }
}
