const Languages = {
  ENGLISH: 'en',
  PORTUGUESE: 'pt'
};

const Themes = {
  LIGHT: 'light',
  DEVICE: 'device',
  DARK: 'dark'
};

function setLanguage(language) {
  if (Object.values(Languages).includes(language)) {
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  } else {
    console.error('Invalid language');
  }
}

function setTheme(theme) {
  if (Object.values(Themes).includes(theme)) {
    localStorage.setItem('theme', theme);
  } else {
    console.error('Invalid theme');
  }
}

function applyState() {
  const language = localStorage.getItem('language') || Languages.ENGLISH;
  const theme = localStorage.getItem('theme') || Themes.DEVICE;

  document.documentElement.lang = language;
  document.getElementById(language).checked = true;
  document.getElementById(theme).checked = true;
}

function addStateForm()
{
    fetch('state-form.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('state-form')
                .innerHTML = data;
            const event = new Event('stateFormLoaded');
            document.dispatchEvent(event);
        })
        .catch(error => console.error('Error fetching state form:', error));
}

document.addEventListener('DOMContentLoaded', addStateForm);
document.addEventListener('stateFormLoaded', applyState);
