// Depends on engrid-click-to-expand.scss to work
// Works when the user has adds ".click-to-expand" as a class to any field
export class ClickToExpand {
    clickToExpandWrapper = document.querySelectorAll('div.click-to-expand') as NodeListOf<HTMLElement>;
    
    constructor() {
        if (this.clickToExpandWrapper.length) {
            this.clickToExpandWrapper.forEach((element: HTMLElement) => {
                const content = element.innerHTML;
                const wrapper_html = '<div class="click-to-expand-cta"></div><div class="click-to-expand-text-wrapper" tabindex="0">' + content + '</div>';
                element.innerHTML = wrapper_html;
                element.addEventListener("click", this.expand.bind(this, element as HTMLElement));
                element.addEventListener("keydown", event => {
                    if ((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space') {
                        console.log("Enter or Space Bar was clicked while focusing on a click-to-expand div");
                        this.expand.bind(element as HTMLElement);
                    }
                  });
            });
        }
    }

    private expand(element: HTMLElement) {
        element.classList.add("expanded");
    }

}