export interface ExitIntentOptions {
  enabled: boolean;
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
  cookieName: string;
  cookieDuration: number;
  triggers: {
    [key: string]: boolean;
  };
}

export const ExitIntentOptionsDefaults: ExitIntentOptions = {
  enabled: false,
  title: "We are sad that you are leaving",
  text: "Would you mind telling us why you are leaving this page?",
  buttonText: "Send us your comments",
  buttonLink: "https://www.4sitestudios.com/",
  cookieName: "engrid-exit-intent-lightbox",
  cookieDuration: 30,
  triggers: {
    visibilityState: true,
    mousePosition: true,
  },
};
