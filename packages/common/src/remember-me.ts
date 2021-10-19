import * as cookie from "./cookie";
import { EnForm } from "./events";
const tippy = require('tippy.js').default;

interface DataObj {
	[key: string]: string
}

export class RememberMe {
	public _form: EnForm = EnForm.getInstance();

	private remoteUrl: string | null;
	private cookieName: string;
	private fieldNames: string[];
	private fieldData: DataObj;
	private cookieExpirationDays: number;
	private iframe: HTMLIFrameElement | null;
	private rememberMeOptIn: boolean;

	private fieldDonationAmountRadioName: string;
	private fieldDonationAmountOtherName: string;
	private fieldDonationRecurrPayRadioName: string;
	private fieldDonationAmountOtherCheckboxID: string;

	private fieldOptInSelectorTarget: string;
	private fieldOptInSelectorTargetLocation: string;
	private fieldClearSelectorTarget: string;
	private fieldClearSelectorTargetLocation: string;

	constructor(options: {
		remoteUrl: string, 
		cookieName: string, 
		cookieExpirationDays: number, 
		fieldNames: string[],
		fieldDonationAmountRadioName: string,
		fieldDonationAmountOtherName: string,
		fieldDonationRecurrPayRadioName: string,
		fieldDonationAmountOtherCheckboxID: string,
		fieldOptInSelectorTarget: string,
		fieldOptInSelectorTargetLocation: string,
		fieldClearSelectorTarget: string,
		fieldClearSelectorTargetLocation: string,
		checked: boolean }) {

		this.iframe = null;

		this.remoteUrl  = ('remoteUrl' in options) ? options.remoteUrl : null;
		this.cookieName = ('cookieName' in options) ? options.cookieName : 'engrid-autofill';
		this.cookieExpirationDays = ('cookieExpirationDays' in options) ? options.cookieExpirationDays : 365;
		this.rememberMeOptIn = ('checked' in options) ? options.checked : false;

		this.fieldNames = ('fieldNames' in options) ? options.fieldNames : [];
		this.fieldDonationAmountRadioName = ('fieldDonationAmountRadioName' in options) ? options.fieldDonationAmountRadioName : 'transaction.donationAmt';
		this.fieldDonationAmountOtherName = ('fieldDonationAmountOtherName' in options) ? options.fieldDonationAmountOtherName : 'transaction.donationAmt.other';
		this.fieldDonationRecurrPayRadioName = ('fieldDonationRecurrPayRadioName' in options) ? options.fieldDonationRecurrPayRadioName : 'transaction.recurrpay';
		this.fieldDonationAmountOtherCheckboxID = ('fieldDonationAmountOtherCheckboxID' in options) ? options.fieldDonationAmountOtherCheckboxID : '#en__field_transaction_donationAmt4';
		
		this.fieldOptInSelectorTarget = ('fieldOptInSelectorTarget' in options) ? options.fieldOptInSelectorTarget : '.en__field--emailAddress.en__field';
		this.fieldOptInSelectorTargetLocation = ('fieldOptInSelectorTargetLocation' in options) ? options.fieldOptInSelectorTargetLocation : 'after';
		
		this.fieldClearSelectorTarget = ('fieldClearSelectorTarget' in options) ? options.fieldClearSelectorTarget : 'label[for="en__field_supporter_firstName"]';
		this.fieldClearSelectorTargetLocation = ('fieldClearSelectorTargetLocation' in options) ? options.fieldClearSelectorTargetLocation : 'before';

		this.fieldData  = {};
		if(this.useRemote()) {
			this.createIframe(() => {
				if(this.iframe && this.iframe.contentWindow) {
					this.iframe.contentWindow.postMessage({ key: this.cookieName, operation: 'read' }, '*');
					this._form.onSubmit.subscribe(() => {
						if(this.rememberMeOptIn) {
							this.readFields();
							this.saveCookieToRemote();
						}
					});					
				}
			}, (event) => {
				if(event.data && event.data.key && event.data.value && event.data.key === this.cookieName) {
					this.updateFieldData(event.data.value);
					this.writeFields();
					let hasFieldData = Object.keys(this.fieldData).length > 0;
					if(!hasFieldData) {
						this.insertRememberMeOptin();
					} else {
						this.insertClearRememberMeLink();
					}
				}
			});
		} else {
			this.readCookie();
			let hasFieldData = Object.keys(this.fieldData).length > 0;
			if(!hasFieldData) {
				this.insertRememberMeOptin();
				this.rememberMeOptIn = false;
			} else {
				this.insertClearRememberMeLink();
				this.rememberMeOptIn = true;
			}
			this.writeFields();
			this._form.onSubmit.subscribe(() => {
				if(this.rememberMeOptIn) {
					this.readFields();
					this.saveCookie();					
				}
			});
		}
	}
	private updateFieldData(jsonData: string) {
		if(jsonData) {
			let data = JSON.parse(jsonData);
			for(let i = 0; i < this.fieldNames.length; i++) {
				if(data[this.fieldNames[i]] !== undefined) {
					this.fieldData[this.fieldNames[i]] = decodeURIComponent(data[this.fieldNames[i]]);
				}
			}
		}
	}
	private insertClearRememberMeLink() {
		if(!document.getElementById('clear-autofill-data')) {
			const clearAutofillLabel = 'clear autofill';		
			const clearRememberMeField = document.createElement('a');
			clearRememberMeField.setAttribute('id', 'clear-autofill-data');
			clearRememberMeField.classList.add('label-tooltip');
			clearRememberMeField.setAttribute('style', 'cursor: pointer;');
			clearRememberMeField.innerHTML = `(${clearAutofillLabel})`

			const targetField = this.getElementByFirstSelector(this.fieldClearSelectorTarget);
			if(targetField) {
				if(this.fieldClearSelectorTargetLocation === 'after') {
					targetField.appendChild(clearRememberMeField);
				} else {
					targetField.prepend(clearRememberMeField);
				}

				clearRememberMeField.addEventListener('click', (e) => {
					e.preventDefault();
					this.clearFields(['supporter.country'/*, 'supporter.emailAddress'*/]);
					if(this.useRemote()) {
						this.clearCookieOnRemote();
					} else {
						this.clearCookie();
					}
					let clearAutofillLink = document.getElementById('clear-autofill-data');
					if(clearAutofillLink) {
						clearAutofillLink.style.display = 'none';
					}
					this.rememberMeOptIn = false;
				});
			}
		}
	}
	private getElementByFirstSelector(selectorsString: string) {
		// iterate through the selectors until we find one that exists
		let targetField = null;
		const selectorTargets = selectorsString.split(',');
		for(let i = 0; i < selectorTargets.length; i++) {
			targetField = document.querySelector(selectorTargets[i]) as HTMLInputElement;
			if(targetField) {
				break;
			}
		}
		return targetField;
	}
	private insertRememberMeOptin() {
		let rememberMeOptInField = document.getElementById('remember-me-opt-in') as HTMLInputElement;
		if(!rememberMeOptInField) {
			const rememberMeLabel = 'Remember Me';
			const rememberMeInfo = `
				Check “Remember me” to complete forms on this device faster. 
				While your financial information won’t be stored, you should only check this box from a personal device. 
				Click “Clear autofill” to remove the information from your device at any time.
			`;

			const rememberMeOptInFieldChecked = (this.rememberMeOptIn) ? 'checked' : '';
			const rememberMeOptInField = document.createElement('div');
			rememberMeOptInField.classList.add('en__field', 'en__field--checkbox');
			rememberMeOptInField.setAttribute('id', 'remember-me-opt-in');
			rememberMeOptInField.setAttribute('style', 'overflow-x: hidden;');
			rememberMeOptInField.innerHTML = `
				<div class="en__field__item rememberme-wrapper">
					<input id="remember-me-checkbox" type="checkbox" class="en__field__input en__field__input--checkbox" ${rememberMeOptInFieldChecked} />
					<label for="remember-me-checkbox" class="en__field__label en__field__label--item" style="white-space: nowrap;">
						<div class="rememberme-content" style="display: inline-flex; align-items: center;">
							${rememberMeLabel}
							<a id="rememberme-learn-more-toggle" style="display: inline-block; display: inline-flex; align-items: center; cursor: pointer; margin-left: 10px;">
								<svg style="height: 14px; width: auto; z-index: 1;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 7H9V5H11V7ZM11 9H9V15H11V9ZM10 2C5.59 2 2 5.59 2 10C2 14.41 5.59 18 10 18C14.41 18 18 14.41 18 10C18 5.59 14.41 2 10 2ZM10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0Z" fill="currentColor"/></svg>
							</a>
						</div>
					</label>
				</div>
			`;

			const targetField = this.getElementByFirstSelector(this.fieldOptInSelectorTarget);
			if(targetField && targetField.parentNode) {
				targetField.parentNode.insertBefore(rememberMeOptInField, (this.fieldOptInSelectorTargetLocation == 'before') ? targetField : targetField.nextSibling);
				
				const rememberMeCheckbox = document.getElementById('remember-me-checkbox') as HTMLInputElement;
				if(rememberMeCheckbox) {
					rememberMeCheckbox.addEventListener('change', () => {
						if(rememberMeCheckbox.checked) {
							this.rememberMeOptIn = true;
						} else {
							this.rememberMeOptIn = false;
						}
					});
				}

				tippy('#rememberme-learn-more-toggle', { content: rememberMeInfo });
			}

		} else if(this.rememberMeOptIn) {
			rememberMeOptInField.checked = true;
		}
	}
	private useRemote() {
		return (this.remoteUrl && window.postMessage && window.JSON && window.localStorage);
	}
	private createIframe(iframeLoaded: () => void, messageReceived: (event: { data?: { key?: string, value?: string }}) => void) {		
		if(this.remoteUrl) {
			let iframe = document.createElement('iframe');
			iframe.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;';
			iframe.src = this.remoteUrl;
			iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
			this.iframe = iframe;
			document.body.appendChild(this.iframe);
			this.iframe.addEventListener('load', () => iframeLoaded(), false);
			window.addEventListener('message', (event) => messageReceived(event), false);
		}
	}
	private clearCookie() {
		this.fieldData = {};
		this.saveCookie();
	}
	private clearCookieOnRemote() {
		this.fieldData = {};
		this.saveCookieToRemote();
	}
	private saveCookieToRemote() {
		if(this.iframe && this.iframe.contentWindow) {
			this.iframe.contentWindow.postMessage({ key: this.cookieName, value: JSON.stringify(this.fieldData), operation: 'write', expires: this.cookieExpirationDays }, '*');
		}		
	}
	private readCookie() {
		this.updateFieldData(cookie.get(this.cookieName) || '');
	}
	private saveCookie() {
		cookie.set(this.cookieName, JSON.stringify(this.fieldData), { expires: this.cookieExpirationDays });
	}
	private readFields() {
		for(let i = 0; i < this.fieldNames.length; i++) {
			let fieldSelector = "[name='" + this.fieldNames[i] + "']";
			let field = document.querySelector(fieldSelector) as HTMLInputElement;
			if(field) {
				if(field.tagName === 'INPUT') {
					let type = field.getAttribute('type');
					if(type === 'radio' || type === 'checkbox') {
						field = document.querySelector(fieldSelector + ":checked") as HTMLInputElement;
					}
					this.fieldData[this.fieldNames[i]] = encodeURIComponent(field.value);
				} else if(field.tagName === 'SELECT') {
					this.fieldData[this.fieldNames[i]] = encodeURIComponent(field.value);
				}
			}
		}
	}
	private setFieldValue(field: HTMLInputElement, value: string | undefined, overwrite: boolean = false) {
		if(field && value !== undefined) {
			if(field.value && overwrite || !field.value) {
				field.value = value;
			}
		}
	}
	private clearFields(skipFields: string[]) {		
		for(let key in this.fieldData) {
			if(skipFields.includes(key)) {
				delete this.fieldData[key];
			} else if(this.fieldData[key] === '') {
				delete this.fieldData[key];
			} else {
				this.fieldData[key] = '';
			}
		}		
		this.writeFields(true);
	}
	private writeFields(overwrite: boolean = false) {
		for(let i = 0; i < this.fieldNames.length; i++) {
			let fieldSelector = "[name='" + this.fieldNames[i] + "']";
			let field = document.querySelector(fieldSelector) as HTMLInputElement;
			if(field) {
				if(field.tagName === 'INPUT') {
					if(this.fieldNames[i] === this.fieldDonationRecurrPayRadioName) {
						if(this.fieldData[this.fieldNames[i]] === 'Y') {
							field.click();
						}
					} else if(this.fieldDonationAmountRadioName === this.fieldNames[i]) {
						field = document.querySelector(fieldSelector + "[value='" + this.fieldData[this.fieldNames[i]] + "']") as HTMLInputElement;
						if(field) {
							field.click();
						} else {
							field = document.querySelector("input[name='" + this.fieldDonationAmountOtherName + "']") as HTMLInputElement;
							this.setFieldValue(field, this.fieldData[this.fieldNames[i]], true);
						}
					} else {
						this.setFieldValue(field, this.fieldData[this.fieldNames[i]], overwrite);
					}
				} else if(field.tagName === 'SELECT') {
					this.setFieldValue(field, this.fieldData[this.fieldNames[i]], overwrite);
				}
			}
		}
	}
}