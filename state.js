/* #region State Management */
const Languages = {
  ENGLISH: 'en',
  PORTUGUESE: 'pt'
};

const Themes = {
  LIGHT: 'light',
  DEVICE: 'device',
  DARK: 'dark'
};

/** Sets the language of the document. */
function setLanguage(language) {
  if (Object.values(Languages).includes(language)) {
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  } else {
    console.error('Invalid language');
  }
}

/** Sets the language of the document. */
function setTheme(theme) {
  if (Object.values(Themes).includes(theme)) {
    localStorage.setItem('theme', theme);
  } else {
    console.error('Invalid theme');
  }
}

/** Configures the state of the page at start up. */
function applyState() {
  const language = localStorage.getItem('language') || Languages.ENGLISH;
  const theme = localStorage.getItem('theme') || Themes.DEVICE;

  document.documentElement.lang = language;
  document.getElementById(language).checked = true;
  document.getElementById(theme).checked = true;
}
/* #endregion */

/* #region Navigation Management*/

const NavigationType = {
  EXTERNAL: 'external',
  INTERNAL: 'internal',
  RELOAD: 'reload'
};

/** Manages the navigation-stack used for the animation */
function navigationManager() {
  const navEntries = performance.getEntriesByType('navigation');

  if (navEntries.length > 0) {
    switch (navEntries[0].type) {
      case 'reload':
        return NavigationType.RELOAD;
      case 'back_forward':
      case 'navigate':
        const referrer = document.referrer;
        const currentDomain = window.location.origin;
        if ((!referrer || referrer === '')
          || (referrer && !referrer.startsWith(currentDomain))) {
          return externalNavigation();
        }
        return internalNavigation();
    }
  }
}

/** Manages navigation from external origins */
function externalNavigation() {
  console.error('external');

  clearNavigationStack();
  return NavigationType.EXTERNAL;
}

/** Manages navigation from internal origins */
function internalNavigation() {
  let url = window.location.href;
  if (url.includes('www.')) {
    url.replace(/^.*www\./, '');
  }
  //*
  else if (url.includes('127.0.0.1:5500/')) {
    url = window.location.href.replace(/^.*127\.0\.0\.1:5500\//, '');;
  }
  //*/

  if (url ==='' || url.includes('index')) {
    url = '/';
  }

  addUrlToNavigationStack(url);

  return NavigationType.INTERNAL;
}

/** Adds URL to navigation stack. */
function addUrlToNavigationStack(url = '/') {
  let navigationStack = JSON.parse(localStorage.getItem('navigation-stack')) || [];

  navigationStack.push(url);

  localStorage.setItem('navigation-stack', JSON.stringify(navigationStack));
}

/** Clears navigation stack. */
function clearNavigationStack() {
  localStorage.removeItem('navigation-stack');
}

/** @returns All items from the navigation stack. */
function getAllNavigationItems() {
  let navigationStack = JSON.parse(localStorage.getItem('navigation-stack')) || [];
  if (navigationStack.length === 0) {
    addUrlToNavigationStack();
    navigationStack = JSON.parse(localStorage.getItem('navigation-stack')) || [];
  }

  //*
  console.error('navigationStack:\n' + navigationStack.join('\n'));
  //*/

  return navigationStack;
}

/* #endregion */

/* #region Animation */

const cursorChar = '█';

/** Manages the loading animation. */
async function loadingAnimation(loadType, signal) {
  const loadScreenElement = document.getElementById('load-screen');

  const navigationStack = getAllNavigationItems();
  if (navigationStack.length > 1) {
    generateNavigationHistory(navigationStack, loadScreenElement);
  }

  const pElement = document.createElement('p');
  const urlTextElement = document.createElement('span');
  const textAnimationElement = document.createElement('span');
  pElement.append(urlTextElement, document.createTextNode('>'), textAnimationElement);
  loadScreenElement.append(pElement);

  console.error(loadType);

  if (loadType === NavigationType.INTERNAL) {
    if (navigationStack.length >= 2) {
      urlTextElement.textContent = `saleca:\\${navigationStack[navigationStack.length - 2] === '/'? '' : navigationStack[navigationStack.length - 2]}`;
      await animateText(`cd ${navigationStack[navigationStack.length - 1] === '/'? '..' : navigationStack[navigationStack.length - 1]}`, textAnimationElement, signal)
    }
    else {
      console.error('invalid navigationStack length')
    }
  }
  else { //if external or reload
    if (navigationStack.length > 0) {
      urlTextElement.textContent = `saleca:\\${navigationStack[navigationStack.length - 1] === '/'? '' : navigationStack[navigationStack.length - 1]}`;;
      threeDotsAnimation(textAnimationElement, signal);
    }
    else {
      console.error('invalid navigationStack length')
    }
  }
}

function generateNavigationHistory(navigationStack, loadScreenElement) {
  const length = navigationStack.length - 1;
  for (let i = 1; i < length; i++) {
    const text = `saleca:\\${navigationStack[i - 1] === '/'? '':navigationStack[i - 1]}>cd ${navigationStack[i] === '/'? '..' : navigationStack[i]}`;
    const p = document.createElement('p');
    p.textContent = text;
    loadScreenElement.append(p);
  }
}

async function animateText(text, textAnimationElement, signal) {
  await animateCursor(textAnimationElement, 3);
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (textAnimationElement.textContent.includes(cursorChar)) {
      textAnimationElement.textContent = textAnimationElement.textContent.replace(cursorChar, '');
    }
    textAnimationElement.textContent += character + cursorChar;
    if (character === '/') {
      await animateCursor(textAnimationElement, 1);
    }
    else {
      await delay(100 + Math.random() * 200)
    }
  }

  if (!signal.aborted) {
    threeDotsAnimation(textAnimationElement, signal, text);
  }
}

/** Helper function to simulate input. 
 * @async
 * @param {AbortSignal} signal - The signal to control the abortion of the animation.
 */
async function threeDotsAnimation(textAnimationElement, signal, defaultText = '') {
  let i = 0;
  const text = defaultText.length > 0 ? defaultText + ' ' : '';
  while (!signal.aborted) {
    let textAnimation = text;
    switch (i) {
      case 0:
        await animateCursor(textAnimationElement, 3);
        textAnimation = `.` + cursorChar;
        break;
      case 1:
        await delay(300 + Math.random() * 300);
        textAnimation = `..` + cursorChar;
        break;
      case 2:
        await delay(300 + Math.random() * 300);
        textAnimation = `...` + cursorChar;
        break;
      case 3:
        await animateCursor(textAnimationElement, 6);
        textAnimation = `` + cursorChar;
        break;
    }
    textAnimationElement.textContent = textAnimation;

    i++
    if (i > 3) {
      i = 0;
    }
  }
}

/** Helper function to delay execution. 
 * @async
 * @param {Number} ms - The delay time in miliseconds.
 */
async function delay(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

/** Animates the cursor
* @param {HTMLSpanElement} textAnimationElement element where the cursor is animated. 
* @param {Number} n number of times the cursor is animated.
*/
async function animateCursor(textAnimationElement, n) {
  for (let b = 0; b < n; b++) {
    await delay(500);
    blinkCursor();
  }

  /** Switches the state of the cursor */
  function blinkCursor() {
    if (textAnimationElement.textContent.includes(cursorChar)) {
      textAnimationElement.textContent = textAnimationElement.textContent.replace(cursorChar, '');
    } else {
      textAnimationElement.textContent += cursorChar;
    }
  }
}
/* #endregion */

/* #region Load Page */

/** Main function to load resources and managing loading screen. @async */
async function loadResources() {
  const startTime = Date.now();
  //*while using live server
  cleanUrl();
  //*/
  const controller = new AbortController();
  const loadType = navigationManager();
  const loadingPromise = loadingAnimation(loadType, controller.signal);
  await addStateForm();
  applyState();
  await loadingPromise;

  if (Date.now() - startTime < 2000) {
    await new Promise(resolve => setTimeout(resolve, 5000 - (Date.now() - startTime)));
  }

  controller.abort();
  clearLoadScreen();
}

/* while using live server*/
function cleanUrl() {
  let url = window.location.pathname;
  if (url.endsWith('.html')) {
    url = url.replace('.html', '');
    if (url.includes('index')) {
      url = url.replace('index', '');
    }
    history.replaceState(null, '', url);
  }
}
/**/

/** Adds the 'state-form.html' to the element with the ID 'state-form' at start up. @async */
async function addStateForm() {
  await fetch('state-form.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('state-form')
        .innerHTML = data;
    })
    .catch(error => console.error('Error fetching state form:', error));
}

/** When loading is complete clears the loading screen. */
function clearLoadScreen() {
  const loadScreen = document.getElementById('load-screen');
  loadScreen.style.background = `transparent`;
  loadScreen.style.color = 'transparent';
  setTimeout(() => {
    loadScreen.style.display = 'none';
    document.body.style.overflow = 'auto';
  }, 300);
  document.body.style.transition = 'background-color 0.3s, color 0.3s';
}

document.addEventListener('DOMContentLoaded', loadResources);
/* #endregion */