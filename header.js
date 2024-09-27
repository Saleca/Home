class HeaderComponent extends HTMLElement {
    connectedCallback() {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                const template = document.createElement('template');
                template.innerHTML = data;
                this.appendChild(template.content.cloneNode(true));
            });
    }
}

customElements.define('header-component', HeaderComponent);