const loadingEvents = {
    STATE_SCRIPT: 'state-manager.js loaded',
    FOOTER_SCRIPT: 'footer-manager.js loaded',
    SNIPPET_SCRIPT: 'snippet-manager.js loaded',
    LOCAL_SNIPPETS_LOADED: 'local snippets loaded',
    CONSOLE_ANIM_SCRIPT: 'console-animation.js loaded'
}

//expected url params = anim, theme, lang
async function addBaseElements() {
    const startTime = Date.now();
    const metaDocument = document.querySelector('meta[name="document"]');
    const metaUnityGame = document.querySelector('meta[name="unity-game"]');
    const metaHasKeys = document.querySelector('meta[name="has-keys"]');
    const metaHasModal = document.querySelector('meta[name="has-modal"]');
    const urlParams = new URLSearchParams(window.location.search);
    const initialStyle = document.styleSheets[0];

    let anim = true;
    if (urlParams.has("anim")) {
        anim = urlParams.get("anim") === 'true';
    }

    if (metaDocument)//if exists its implicitly true 
    {
        anim = false;
        addStyleSheet("print.css");
    }

    addIcon("sun.svg");
    addStyleSheet("main.css");

    const stateScriptLoad = waitEvent(loadingEvents.STATE_SCRIPT);
    addScript("state-manager.js");

    const consoleAnimScriptLoad = waitEvent(loadingEvents.CONSOLE_ANIM_SCRIPT);
    if (anim) {
        addScript("console-animation.js");
    }
    else {
        window.dispatchEvent(new Event(loadingEvents.CONSOLE_ANIM_SCRIPT));
    }
    await consoleAnimScriptLoad;

    let loadingPromise;
    let controller;
    const navigationType = navigationAnalizer();
    if (anim) {
        controller = new AbortController();
        loadingPromise = loadingAnimation(navigationType, controller.signal);
    }

    const main = document.querySelector('main');

    const page = document.createElement('div');
    page.id = "page";
    document.body.appendChild(page);

    const resizable = document.createElement('div');
    resizable.id = 'resizable';
    page.appendChild(resizable);

    const headedLoad = injectLocalSnippet(resizable, componentPath('header'));
    await headedLoad;
    await stateScriptLoad;
    applyState(urlParams.get("lang"), urlParams.get("theme"));
    addPagePath();

    resizable.appendChild(main);

    await injectLocalSnippet(page, componentPath('footer'));

    const footerScriptLoad = waitEvent(loadingEvents.FOOTER_SCRIPT);
    addScript("footer-manager.js");

    if (metaHasModal) {
        addStyleSheet("modal.css");
        addScript("modal-manager.js");
    }

    if (metaHasKeys) {
        addStyleSheet("keys.css");
    }

    if (metaUnityGame) {
        addScriptAbs(
            "/resources/files/WebGL_Snake_Explorer_Build/Builds.loader.js",
            function () {
                addScript("initialize-unity-player.js");
            });
    }

    const snippetScriptLoad = waitEvent(loadingEvents.SNIPPET_SCRIPT);
    addScript("snippet-manager.js");
    await snippetScriptLoad;

    const localSnippetsLoad = waitEvent(loadingEvents.LOCAL_SNIPPETS_LOADED);
    injectLocalSnippets();
    await localSnippetsLoad;

    await footerScriptLoad;
    resizePage();
    scrollToTop();

    if (initialStyle) {
        initialStyle.disabled = true;
    }

    if (anim) {
        await loadingPromise;
        if (Date.now() - startTime < 2000) {
            await new Promise(resolve => setTimeout(resolve, 5000 - (Date.now() - startTime)));
        }
        controller.abort();
        clearLoadScreen();
    }
}

const NavigationType = {
    RELOAD: 'reload',
    NAVIGATION: 'navigation'
};

/** Analizes navigation type */
function navigationAnalizer() {
    const navEntries = performance.getEntriesByType('navigation');

    if (navEntries.length > 0) {
        switch (navEntries[0].type) {
            case 'reload':
                return NavigationType.RELOAD;
            case 'back_forward':
            case 'navigate':
                return manageNavigation();
        }
    }
}

/** Manages navigation */
function manageNavigation() {
    addPathToNavigationStack(getPath());
    return NavigationType.NAVIGATION;
}

function getPath() {
    let path = window.location.href;

    //*
    if (path.includes('saleca.im/')) {
        path = path.replace(/^.*saleca.im\//, '');
    }
    //*/
    /* gitbub pages default url
    if (path.includes('saleca.github.io/Home/')) {
      path = path.replace(/^.*saleca.github.io\/Home\//, '');
      }
      //*/
    //* live server
    if (path.includes('127.0.0.1:5500/')) {
        path = window.location.href.replace(/^.*127\.0\.0\.1:5500\//, '');
    }
    //*/

    if (path.includes('p/')) {
        path = path.replace(/^.*p\//, '')
    }

    if (path.includes('?')) {
        path = path.slice(0, path.indexOf('?'));
    }

    if (path.includes('wwww.')) {
        path = path.replace(/^.*www./, '');
    }

    if (path.includes('.html')) {
        path = path.replace('.html', '');
    }

    if (path.includes('index')) {
        path = path.replace('index', '');
    }

    if (path.endsWith("/")) {
        path = path.slice(0, -1);
    }

    if (path === '') {
        path = '\\';
    } else {
        path = path.replace('/', '\\');
    }
    return path;
}

/** Adds path to navigation stack. */
function addPathToNavigationStack(path = '\\') {
    let navigationStack = JSON.parse(sessionStorage.getItem('navigation-stack')) || [];
    navigationStack.push(path);
    sessionStorage.setItem('navigation-stack', JSON.stringify(navigationStack));
    //console.info('Navigation stack updated.');
}

/** @returns All items from the navigation stack. */
function getAllNavigationItems() {
    let navigationStack = JSON.parse(sessionStorage.getItem('navigation-stack')) || [];
    if (navigationStack.length === 0) {
        addPathToNavigationStack();
        navigationStack = JSON.parse(sessionStorage.getItem('navigation-stack'));
    }

    /*
    console.info('navigationStack:\n' + navigationStack.join('\n') + '\n----------------');
    //*/

    return navigationStack;
}

function getCurrentPath() {
    const navigationItems = getAllNavigationItems();
    return navigationItems[navigationItems.length - 1];
}

function addPagePath() {
    const pagePathElement = document.getElementById('page-path');
    const path = getCurrentPath();
    console.log(path);
    if (path !== '\\') {
        const homeLink = document.createElement('a');
        homeLink.href = "/";
        homeLink.textContent = 'saleca';
        pagePathElement.appendChild(homeLink);
    } else {
        pagePathElement.appendChild(document.createTextNode('saleca'));
    }
    pagePathElement.appendChild(document.createTextNode(':\\'));

    if (path !== '\\') {
        const parts = path.split('\\');
        let currentPath = '/';
        parts.forEach((part, index) => {
            currentPath += part;

            if (index < parts.length - 1) {
                const link = document.createElement('a');
                link.textContent = part;
                link.href = currentPath;
                pagePathElement.appendChild(link);
                pagePathElement.appendChild(document.createTextNode('\\'));
                currentPath += '/';
            } else {
                pagePathElement.appendChild(document.createTextNode(part));
            }
        });
    }
    pagePathElement.appendChild(document.createTextNode('>'));
}

function clearLoadScreen() {
    const loadScreen = document.getElementById('load-screen');
    loadScreen.style.background = `transparent`;
    loadScreen.style.color = 'transparent';
    setTimeout(() => {

        document.body.removeChild(loadScreen);
        document.body.style.overflow = 'auto';
    }, 300);
}

async function injectLocalSnippet(container, path) {
    const promise = waitEvent(path);

    const response = await fetch(path);
    if (!response.ok) {
        console.log("failed to fech");
        return;
    }
    const content = await response.text();

    container.innerHTML += content;

    window.dispatchEvent(new Event(path));
    return promise;
}

function componentPath(name) {
    return `/components/${name}.html`;
}

function addIcon(path) {
    const icon = document.createElement('link');
    icon.rel = "icon";
    icon.type = "image/svg";
    icon.href = "/resources/icons/" + path;
    document.head.appendChild(icon);
}

function addStyleSheet(path) {
    const modalCss = document.createElement('link');
    modalCss.rel = "stylesheet";
    modalCss.type = "text/css";
    modalCss.href = "/css/" + path;
    document.head.appendChild(modalCss);
}

function addScriptAbs(path, onLoadCallback) {
    const script = document.createElement('script');
    script.src = path;
    if (onLoadCallback) {
        script.onload = onLoadCallback;
    }
    document.head.appendChild(script);
}

function addScript(path, onLoadCallback) {
    addScriptAbs("/js/" + path, onLoadCallback);
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