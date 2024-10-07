const repo = 'Home';

function addBaseElements() {
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
    stateScript.defer = true;
    head.appendChild(stateScript);

    const structureScript = document.createElement('script');
    structureScript.src = "js/structure.js";
    structureScript.defer = true;
    head.appendChild(structureScript);

    const loadScreenElement = document.createElement('div');
    loadScreenElement.id = 'load-screen';
    document.body.insertBefore(loadScreenElement, document.body.firstChild);
    

}

/*<meta name="document" content="true">*/