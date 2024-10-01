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
  clearNavigationStack();
  return NavigationType.EXTERNAL;
}

/** Manages navigation from internal origins */
function internalNavigation() {
  let path = window.location.href;
  /*
  if (path.includes('www.')) {
    path = path.replace(/^.*www\./, '');
  } 
  //*/
  if (path.includes('saleca.github.io/PrivacyPolicy/')) { 
    path = path.replace(/^.*saleca.github.io\/PrivacyPolicy\//, '');
  }
  /* live server
  if (path.includes('127.0.0.1:5500/')) {
    path = window.location.href.replace(/^.*127\.0\.0\.1:5500\//, '');
  }
  //*/

  if (path.includes('.html')) {
    path = path.replace('.html', '');
  }

  if (path.includes('index')) {
    path = path.replace('index', '');
  }

  if (path === '') {
    path = '\\';
  } else {
    path = path.replace('/', '\\');
  }

  addPathToNavigationStack(path);

  return NavigationType.INTERNAL;
}

/** Adds path to navigation stack. */
function addPathToNavigationStack(path = '\\') {
  let navigationStack = JSON.parse(localStorage.getItem('navigation-stack')) || [];

  navigationStack.push(path);

  localStorage.setItem('navigation-stack', JSON.stringify(navigationStack));
  //console.info('Navigation stack updated.');
}

/** Clears navigation stack. */
function clearNavigationStack() {
  localStorage.removeItem('navigation-stack');
  //console.info('Navigation stack cleared.');
}

/** @returns All items from the navigation stack. */
function getAllNavigationItems() {
  let navigationStack = JSON.parse(localStorage.getItem('navigation-stack')) || [];
  if (navigationStack.length === 0) {
    addPathToNavigationStack();
    navigationStack = JSON.parse(localStorage.getItem('navigation-stack')) || [];
  }

  //*
  console.info('navigationStack:\n' + navigationStack.join('\n') + '\n----------------');
  //*/

  return navigationStack;
}

/* #endregion */

/* #region Animation */

const cursorChar = '█';
const writeSpeedMS = 50;
const writeSpeedVariationMS = 150;
const writeHoldMS = 200;
const cursorSpeedMS = 400;

/** Manages the loading animation. */
async function loadingAnimation(loadType, signal) {
  const loadScreenElement = document.getElementById('load-screen');
  startConsole(loadScreenElement);
  const navigationStack = getAllNavigationItems();
  if (navigationStack.length > 1) {
    if (loadType === NavigationType.RELOAD) {
      generateNavigationHistory(navigationStack, loadScreenElement);
    } else {
      generateNavigationHistory(navigationStack.slice(0, navigationStack.length - 1), loadScreenElement);
    }
  }

  const currentConsoleLine = document.createElement('p');
  const dirElement = document.createElement('span');
  const navElement = document.createElement('span');
  currentConsoleLine.append(dirElement, document.createTextNode('>'), navElement);
  loadScreenElement.append(currentConsoleLine);

  if (loadType === NavigationType.INTERNAL) {
    if (navigationStack.length > 1) {
      dirElement.textContent = formatDirectoryPath(navigationStack[navigationStack.length - 2]);
      await animateText(formatNavigationPath(navigationStack[navigationStack.length - 1]), navElement, signal);
    } else {
      console.error('Internal navigation requires stack with more than one path.');
    }
  }
  else { //external or reload
    if (navigationStack.length > 0) { 
      dirElement.textContent = formatDirectoryPath(navigationStack[navigationStack.length - 1]);
      threeDotsAnimation(navElement, signal);
    } else {
      console.error('External navigation or reload requires stack with at least one path.');
    }
  }
}

function startConsole(loadScreenElement) {
  const start = document.createElement('p');
  start.textContent = 'Saleca Devlopment [Version 0.1]\n(c) Saleca. All rights reserved.';
  loadScreenElement.append(start);
}

function generateNavigationHistory(navigationStack, loadScreenElement) {
  for (let i = 1; i < navigationStack.length; i++) {
    const dir = document.createElement('p');
    dir.textContent = formatDirectoryPath(navigationStack[i - 1]) + '>' + formatNavigationPath(navigationStack[i]);
    loadScreenElement.append(dir);
  }
}

function formatDirectoryPath(path) {
  return `saleca:\\${path === '\\' ? '' : path}`;
}

function formatNavigationPath(path) {
  return `cd ${path === '\\' ? '..' : path}`;
}

async function animateText(text, navElement, signal) {
  await animateCursor(navElement, 3);
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (navElement.textContent.includes(cursorChar)) {
      navElement.textContent = navElement.textContent.replace(cursorChar, '');
    }
    navElement.textContent += character + cursorChar;
    if (character === '\\') {
      await animateCursor(navElement, 1);
    } else {
      await delay(writeSpeedMS + Math.random() * writeSpeedVariationMS);
    }
  }

  animateCursorIndefinetely(navElement, signal);
}

/** Helper function to animate three dots. 
 * @async
 * @param {AbortSignal} signal - The signal to control the abortion of the animation.
 */
async function threeDotsAnimation(navElement, signal, navText = '') {
  let i = 0;
  const navTextFormated = navText.length > 0 ? navText + ' ' : '';
  while (!signal.aborted) {
    let navAnimation = navTextFormated;
    switch (i) {
      case 0:
        await animateCursor(navElement, 3);
        navAnimation += '.';
        break;
      case 1:
        await delay(writeSpeedMS + Math.random() * writeSpeedVariationMS);
        navAnimation += '..';
        break;
      case 2:
        await delay(writeSpeedMS + Math.random() * writeSpeedVariationMS);
        navAnimation += '...';
        break;
      case 3:
        await animateCursor(navElement, 4);
        navAnimation += '';
        break;
    }
    navElement.textContent = navAnimation + cursorChar;

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
* @param {HTMLSpanElement} navElement element where the cursor is animated. 
* @param {Number} n number of times the cursor is animated.
*/
async function animateCursor(navElement, n) {
  for (let b = 0; b < n; b++) {
    await delay(cursorSpeedMS);
    blinkCursor(navElement);
  }
}

/** Animates the cursor
* @param {HTMLSpanElement} navElement element where the cursor is animated. 
* @param {AbortSignal} signal Signal to abort execution.
*/
async function animateCursorIndefinetely(navElement, signal) {
  while (!signal.aborted) {
    await delay(cursorSpeedMS);
    blinkCursor(navElement);
  }
}

/** Switches the state of the cursor */
function blinkCursor(navElement) {
  if (navElement.textContent.includes(cursorChar)) {
    navElement.textContent = navElement.textContent.replace(cursorChar, '');
  } else {
    navElement.textContent += cursorChar;
  }
}
/* #endregion */

/* #region Load Page */

/** Main function to load resources and managing loading screen. @async */
async function loadResources() {
  const startTime = Date.now();
  /*while using live server
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

/* while using live server
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
//*/

/** Adds the 'state-form.html' to the element with the ID 'state-form' at start up. @async */
async function addStateForm() {
  await fetch('state-form.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('state-form').innerHTML = data;
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