/** Adds the 'state-form.html' to the element with the ID 'state-form' at start up. */
function addStateForm() {
    addComponent('state-form');
}

function addHeader() {
    addComponent('header');
}

function addComponent(component) {
    fetch(`components/${component}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById(component).innerHTML = data;
            window.dispatchEvent(new Event(`${component}-added`));
        })
        .catch(error => console.error(`Error fetching ${component}:`, error));
}

window.addEventListener('add-state-form', addStateForm);
window.addEventListener('add-header', addHeader);

