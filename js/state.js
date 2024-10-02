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
  RELOAD: 'reload',
  EXTERNAL: 'external',
  INTERNAL: 'internal'
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
        const path = getPath();
        const referrer = document.referrer;
        const currentDomain = window.location.origin;
        if ((!referrer || referrer === '')
          || (referrer && !referrer.startsWith(currentDomain))) {
          return externalNavigation(path);
        }

        return internalNavigation(path);
    }
  }
}

/** Manages navigation from external origins */
function externalNavigation(path) {
  clearNavigationStack();
  addPathToNavigationStack(path);
  return NavigationType.EXTERNAL;
}

/** Manages navigation from internal origins */
function internalNavigation(path) {
  addPathToNavigationStack(path);
  return NavigationType.INTERNAL;
}

function getPath() {
  let path = window.location.href;
  if (path.includes('saleca.github.io/PrivacyPolicy/')) {
    path = path.replace(/^.*saleca.github.io\/PrivacyPolicy\//, '');
  }
  //* live server
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
  let navigationStack = JSON.parse(localStorage.getItem('navigation-stack')) || [];
  navigationStack.push(path);
  localStorage.setItem('navigation-stack', JSON.stringify(navigationStack));
  //console.info('Navigation stack updated.');
}

/** @returns All items from the navigation stack. */
function getAllNavigationItems() {
  let navigationStack = JSON.parse(localStorage.getItem('navigation-stack')) || [];
  if (navigationStack.length === 0) {
    addPathToNavigationStack();
    navigationStack = JSON.parse(localStorage.getItem('navigation-stack'));
  }

  //*
  console.info('navigationStack:\n' + navigationStack.join('\n') + '\n----------------');
  //*/

  return navigationStack;
}

/** Clears navigation stack. */
function clearNavigationStack() {
  localStorage.removeItem('navigation-stack');
  //console.info('Navigation stack cleared.');
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
      generateConsoleHistory(navigationStack, loadScreenElement);
    } else {
      generateConsoleHistory(navigationStack.slice(0, navigationStack.length - 1), loadScreenElement);
    }
  }

  const currentConsoleLine = document.createElement('p');
  const dirElement = document.createElement('span');
  const inputElement = document.createElement('span');
  currentConsoleLine.append(dirElement, document.createTextNode('>'), inputElement);
  loadScreenElement.append(currentConsoleLine);

  if (loadType === NavigationType.INTERNAL) {
    if (navigationStack.length > 1) {
      const previousPath = navigationStack[navigationStack.length - 2];
      let currentPath = navigationStack[navigationStack.length - 1];

      if (previousPath.includes(currentPath)) { // back navigation
        console.info(currentPath);
        currentPath.replace(previousPath, '');
        console.info(currentPath);
        currentPath = formatBackwardsNavigationPath(currentPath);
        console.info(currentPath);
      } else if (currentPath.includes(previousPath)) { //forward navigation
        currentPath = currentPath.replace(previousPath + '\\', '');
      }

      dirElement.textContent = formatDirectoryPath(previousPath);
      await animateText(formatInputPath(currentPath), inputElement, signal);
    } else {
      console.error('Internal navigation requires stack with more than one path.');
    }
  }
  else { //external or reload
    if (navigationStack.length > 0) {
      dirElement.textContent = formatDirectoryPath(navigationStack[navigationStack.length - 1]);
      threeDotsAnimation(inputElement, signal);
    } else {
      console.error('External navigation or reload requires stack with at least one path.');
    }
  }
}

function startConsole(loadScreenElement) {
  const start = document.createElement('p');
  start.textContent = 'Saleca Development [Version 0.1]\n(c) Saleca. All rights reserved.';
  loadScreenElement.append(start);
}

function generateConsoleHistory(navigationStack, loadScreenElement) {
  for (let i = 1; i < navigationStack.length; i++) {
    const consoleLine = document.createElement('p');
    consoleLine.textContent = generateConsoleLine(navigationStack[i - 1], navigationStack[i]);
    loadScreenElement.append(consoleLine);
  }
}

function formatBackwardsNavigationPath(path) {
  return path.replace(/(?:'[^']*'|[^\\]+)/g, '..');
}

function generateConsoleLine(dir, input) {
  return formatDirectoryPath(dir) + '>' + formatInputPath(input);
}

function formatDirectoryPath(path) {
  return `saleca:\\${path === '\\' ? '' : path}`;
}

function formatInputPath(path) {
  return `cd ${path === '\\' ? '..' : path}`;
}

async function animateText(input, inputElement, signal) {
  await animateCursor(inputElement, 3);
  for (let i = 0; i < input.length; i++) {
    const character = input[i];
    if (inputElement.textContent.includes(cursorChar)) {
      inputElement.textContent = inputElement.textContent.replace(cursorChar, '');
    }
    inputElement.textContent += character + cursorChar;
    if (character === '\\') {
      await animateCursor(inputElement, 1);
    } else {
      await delay(writeSpeedMS + Math.random() * writeSpeedVariationMS);
    }
  }
  await animateCursor(inputElement, 3);
  animateCursorIndefinetely(inputElement, signal);
}

/** Helper function to animate three dots. 
 * @async
 * @param {AbortSignal} signal - The signal to control the abortion of the animation.
 */
async function threeDotsAnimation(inputElement, signal, previousInput = '') {
  let i = 0;
  const staticInput = previousInput.length > 0 ? previousInput + ' ' : '';
  while (!signal.aborted) {
    let currentInput = staticInput;
    switch (i) {
      case 0:
        await animateCursor(inputElement, 3);
        currentInput += '.';
        break;
      case 1:
        await delay(writeSpeedMS + Math.random() * writeSpeedVariationMS);
        currentInput += '..';
        break;
      case 2:
        await delay(writeSpeedMS + Math.random() * writeSpeedVariationMS);
        currentInput += '...';
        break;
      case 3:
        await animateCursor(inputElement, 4);
        currentInput += '';
        break;
    }
    inputElement.textContent = currentInput + cursorChar;

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
* @param {HTMLSpanElement} inputElement element where the cursor is animated. 
* @param {Number} n number of times the cursor is animated.
*/
async function animateCursor(inputElement, n) {
  for (let b = 0; b < n; b++) {
    await delay(cursorSpeedMS);
    blinkCursor(inputElement);
  }
}

/** Animates the cursor
* @param {HTMLSpanElement} inputElement element where the cursor is animated. 
* @param {AbortSignal} signal Signal to abort execution.
*/
async function animateCursorIndefinetely(inputElement, signal) {
  while (!signal.aborted) {
    await delay(cursorSpeedMS);
    blinkCursor(inputElement);
  }
}

/** Switches the state of the cursor */
function blinkCursor(inputElement) {
  if (inputElement.textContent.includes(cursorChar)) {
    inputElement.textContent = inputElement.textContent.replace(cursorChar, '');
  } else {
    inputElement.textContent += cursorChar;
  }
}

/* #endregion */

/* #region Load Page */

/** Main function to load resources and managing loading screen. @async */
async function loadResources() {
  const startTime = Date.now();

  /* live server
  cleanUrl();
  //*/

  const controller = new AbortController();
  const loadType = navigationManager();
  const loadingPromise = loadingAnimation(loadType, controller.signal);

  /* mobile only (test)
  if(IsMobile()) {
    window.addEventListener('popstate', forceReload);
  }
  //*/

  const stateFormAdded = waitEvent('state-form-added');
  window.dispatchEvent(new Event('add-state-form'));
  await stateFormAdded;
  const headerAdded = waitEvent('header-added');
  window.dispatchEvent(new Event('add-header'));
  applyState();
  await headerAdded;
  await loadingPromise;

  if (Date.now() - startTime < 2000) {
    await new Promise(resolve => setTimeout(resolve, 5000 - (Date.now() - startTime)));
  }

  controller.abort();
  clearLoadScreen();
}

/* mobile only (test)
function forceReload() {
    const url = window.location.href.split('?')[0];
    window.location.href = `${url}?cache_bust=1`;
}

function isMobile() {
  return /Mobi/i.test(navigator.userAgent);
}
//*/

/* live server
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

function waitEvent(event) {
  return new Promise((resolve) => {
    const eventHandler = () => {
      window.removeEventListener(event, eventHandler);
      resolve();
    };
    window.addEventListener(event, eventHandler);
  });
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