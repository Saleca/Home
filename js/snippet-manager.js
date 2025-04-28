/*
async function injectSnippet(snipet) {
    const url = snipet.dataset.url;
    const response = await fetch(url);
    if (!response.ok) {
        console.log("failed to fech");
        return;
    }
    const content = await response.text();
    snipet.innerHTML = content;
}

async function injectSnippets() {
    const snipets = document.querySelectorAll('[data-url]');
    for (const snipet of snipets) {
        await injectSnippet(snipet)
    };
}
//*/

async function injectLocalSnippets() {
    const snipets = document.querySelectorAll('[data-path]');
    for (const element of snipets) {
        await injectLocalSnippet(element, element.dataset.path, true);
    };
    window.dispatchEvent(new Event(loadingEvents.LOCAL_SNIPPETS_LOADED));
}

window.dispatchEvent(new Event(loadingEvents.SNIPPET_SCRIPT));
