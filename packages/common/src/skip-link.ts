// Javascript that adds an accessible "Skip Link" button after the <body> opening that jumps to
// the first <title> or <h1> field in a "body-" section, or the first <h1> if none are found
// in those sections
// Depends on _engrid-skip-link.scss

import { EngridLogger } from "./";

export class SkipToMainContentLink {
  private logger: EngridLogger = new EngridLogger("Skip to Main Content Link");

  constructor() {
    const firstTitleInEngridBody = document.querySelector(
      "div[class*='body-'] title"
    );
    const firstH1InEngridBody = document.querySelector(
      "div[class*='body-'] h1"
    );
    const firstTitle = document.querySelector("title");
    const firstH1 = document.querySelector("h1");

    if (firstTitleInEngridBody && firstTitleInEngridBody.parentElement) {
      firstTitleInEngridBody.parentElement.insertAdjacentHTML(
        "beforebegin",
        '<span id="skip-link"></span>'
      );
      this.insertSkipLinkSpan();
    } else if (firstH1InEngridBody && firstH1InEngridBody.parentElement) {
      firstH1InEngridBody.parentElement.insertAdjacentHTML(
        "beforebegin",
        '<span id="skip-link"></span>'
      );
      this.insertSkipLinkSpan();
    } else if (firstTitle && firstTitle.parentElement) {
      firstTitle.parentElement.insertAdjacentHTML(
        "beforebegin",
        '<span id="skip-link"></span>'
      );
      this.insertSkipLinkSpan();
    } else if (firstH1 && firstH1.parentElement) {
      firstH1.parentElement.insertAdjacentHTML(
        "beforebegin",
        '<span id="skip-link"></span>'
      );
      this.insertSkipLinkSpan();
    } else {
      this.logger.log(
        "This page contains no <title> or <h1> and a 'Skip to main content' link was not added"
      );
    }
  }

  private insertSkipLinkSpan() {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<a class="skip-link" href="#skip-link">Skip to main content</a>'
    );
  }
}
