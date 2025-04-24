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

async function injectLocalSnippet(snipet) {
    const path = snipet.dataset.path;
    const response = await fetch(path);
    if (!response.ok) {
        console.log("failed to fech");
        return;
    }
    const content = await response.text();
    snipet.innerHTML = content;
}

async function injectLocalSnippets() {
    const snipets = document.querySelectorAll('[data-path]');
    for (const snipet of snipets) {
        await injectLocalSnippet(snipet);
    };
}

injectLocalSnippets();
//injectSnippets();
