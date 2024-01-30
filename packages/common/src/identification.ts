export interface EngridIdentData {
  type: string;
  payload: string;
}

// fingerprint generation & ip generation happen in constructor
// when the complete their AJAX calls, they populate the associated variables
export class Identification {
	private generateFP: Function;
	private generateIP: Function;

	private _fp: string;
	private _ip: string;

	constructor(options: {
		enableFP?: boolean,
		enableIP?: boolean,
		generateFP?: Function,
		generateIP?: Function
	}) {
		this._fp = '';
		this._ip = '';

		if(options.enableFP || options.generateFP) {
			this.generateFP = options.generateFP ? options.generateFP : () => {
				const _this = this;
				return new Promise(function (resolve, reject) {
					// the fingerprinting might return a different result on the 
					// second check so we check twice and take the latest result
					_this.createIframe('creep1');
					_this.createIframe('creep2');
					const creep1 = document.getElementById('creep1');
					const creep2 = document.getElementById('creep2');
					let messageCount = 0;
					window.addEventListener('message', (message) => {
						console.log('message received', message);
						if(message.source !== creep1 && message.source !== creep2) {
							console.log('message does not match; discarding');
							return;
						}

						console.log(message);

						if(message.data.fp) {
							_this._fp = message.data.fp;
						} else {
							_this._fp = '';
							reject(new Error('FP fetch failed.'));
						}

						messageCount++;
						if(messageCount === 2 && _this._fp) {
							resolve(_this._fp);
						}
					});
				});
			}
			this.generateFP().then(
				(fingerprint: string) => {
					if(fingerprint) {
						this._fp = fingerprint;
						this.dispatchEvent('fp', fingerprint);
					}
				},
				(error: Error) => {
					this._fp = '';
					this.dispatchEvent('fp', '');
				}
			);
		} else {
			this.generateFP = () => {};
		}

		if(options.enableIP || options.generateIP) {
			this.generateIP = options.generateIP ? options.generateIP : () => {
				return new Promise(function (resolve, reject) {
					const xhr = new XMLHttpRequest();
					xhr.onload = function () {
						const matches = this.responseText.match('ip=([0-9\.\-]*)');
						const ip_address = (matches && matches.length > 1) ? matches[1] : '';
						if(ip_address) {
							resolve(ip_address);
						} else {
							reject(new Error('IP address fetch failed.'));
						}
					};
					xhr.onerror = reject;
					xhr.open('GET', 'https://www.cloudflare.com/cdn-cgi/trace');
					xhr.send();
				});
			};
			this.generateIP().then(
				(ip_address: string) => {
					if(ip_address) {
						this._ip = ip_address;
						this.dispatchEvent('ip', ip_address);
					}
				},
				(error: Error) => {
					this._ip = '';
					this.dispatchEvent('ip', '');
				}
			);
		} else {
			this.generateIP = () => {};
		}
	}
	dispatchEvent(type: string, value: string) {
		const event = new CustomEvent<EngridIdentData>('engrid-ident', {
			detail: {
				type: type,
				payload: value				
			}
		});
		window.dispatchEvent(event);
	}
	createIframe(id: string) {
    	let iframe = document.createElement("iframe");
    	iframe.id = id;
    	iframe.setAttribute("allow", "*");
    	iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;";
    	iframe.src = 'https://apps.4sitestudios.com/temp/index.html';
    	iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
    	document.body.appendChild(iframe);
	}
}