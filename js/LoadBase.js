const repo = 'Home';

async function addBaseElements() {
    const head = document.head;
    const isDocument = document.querySelector('meta[name="document"]');

    const base = document.createElement('base');
    base.href = `/${repo}/`;
    head.appendChild(base);

    const link = document.createElement('link');
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "css/main.css";
    head.appendChild(link);

    if (isDocument) {
        const print = document.createElement('link');
        print.rel = "stylesheet";
        print.type = "text/css";
        print.href = "css/print.css";
        head.appendChild(print);
    }

    const stateScript = document.createElement('script');
    stateScript.src = "js/state.js";
    head.appendChild(stateScript);

    await waitEvent('state-loaded');

    const loadScreenElement = document.createElement('div');
    loadScreenElement.id = 'load-screen';
    document.body.insertBefore(loadScreenElement, document.body.firstChild);
    window.dispatchEvent(new Event(`load-screen-added`));

    const hiddenContentElement = document.createElement('div');
    hiddenContentElement.id = 'hidden-content';

    const stateFormElement = document.createElement('div');
    stateFormElement.id = 'state-form';
    addContent('state-form', stateFormElement);
    hiddenContentElement.appendChild(stateFormElement);

    const dividerElement = document.createElement('hr');
    hiddenContentElement.appendChild(dividerElement);

    document.body.insertBefore(hiddenContentElement, document.body.children[1]);

    const pageContainerElement = document.createElement('div');
    pageContainerElement.id = 'page-container';

    const headerElement = document.createElement('header');
    addContent('header', headerElement);
    pageContainerElement.appendChild(headerElement);

    pageContainerElement.appendChild(document.querySelector('main'));

    const footerElement = document.createElement('footer');
    addContent('footer', footerElement);
    pageContainerElement.appendChild(footerElement);

    document.body.appendChild(pageContainerElement);
}

/*<meta name="document" content="true">*/

/** Adds the content of the file `components/${name}.html` to the element with the ID `name` at start up.
 *  dispatches an event with name `${name}-added` when completes successfully.
 * @param {string} name 
 * */
function addContent(name, element) {
    fetch(`components/${name}.html`)
        .then(response => response.text())
        .then(data => {
            element.innerHTML = data;
            window.dispatchEvent(new Event(`${name}-added`));
        })
        .catch(error => console.error(`Error fetching ${name}:`, error));
}

//abstract into a tools script
function waitEvent(event) {
    return new Promise((resolve) => {
      const eventHandler = () => {
        window.removeEventListener(event, eventHandler);
        resolve();
      };
      window.addEventListener(event, eventHandler);
    });
  }

document.addEventListener('DOMContentLoaded', addBaseElements);