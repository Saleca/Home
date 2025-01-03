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
  if (path.includes('saleca.github.io/Home/')) {
    path = path.replace(/^.*saleca.github.io\/Home\//, '');
  }
  /* live server
  if (path.includes('127.0.0.1:5500/')) {
    path = window.location.href.replace(/^.*127\.0\.0\.1:5500\//, '');
  }
  //*/
  if (path.includes('?')) {
    path = path.slice(0, path.indexOf('?'));
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

function CheckDisplayAnimation() {
  const navigationStack = getAllNavigationItems();
  if (navigationStack.length == 1) {
    const isDocument = document.querySelector('meta[name="document"]');
    if (isDocument) {
      return false;
    }
  }
  return true;
}
/* #endregion */

/* #region Animation */

const version = '0.3';
const cursorChar = '█';
const writeSpeedMS = 50;
const writeSpeedVariationMS = 150;
const writeHoldMS = 200;
const cursorSpeedMS = 400;

/** Manages the loading animation. */
async function loadingAnimation(navigationType, signal) {
  const loadScreenElement = document.getElementById('load-screen');
  startConsole(loadScreenElement);
  const navigationStack = getAllNavigationItems();

  if (navigationStack.length > 1) {
    if (navigationType === NavigationType.RELOAD) {
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

  if (navigationType === NavigationType.RELOAD) {
    loadPage(navigationStack, dirElement, inputElement, signal);
    return;
  }

  if (navigationStack.length > 1) {
    const previousPath = navigationStack[navigationStack.length - 2];
    let currentPath = navigationStack[navigationStack.length - 1];
    let input = formatInputPath(previousPath, currentPath);
    dirElement.textContent = formatDirectoryPath(previousPath);
    await animateText(input, inputElement, signal);
    return;
  }

  loadPage(navigationStack, dirElement, inputElement, signal);
}

function loadPage(navigationStack, dirElement, inputElement, signal) {
  if (navigationStack.length > 0) {
    dirElement.textContent = formatDirectoryPath(navigationStack[navigationStack.length - 1]);
    threeDotsAnimation(inputElement, signal);
  }
}

function startConsole(loadScreenElement) {
  const start = document.createElement('p');
  start.textContent = `Saleca Portfolio [Version ${version}]`;
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
  return formatDirectoryPath(dir) + '>' + formatInputPath(dir, input);
}

function formatDirectoryPath(path) {
  return `C:\\${path === '\\' ? '' : path}`;
}

function formatInputPath(dir, input) {
  if (input === '\\') { // back navigation to root
    //do nothing
  } else if (dir.includes(input)) { // rest of back navigations
    const path = dir.replace(input + '\\', '');
    input = formatBackwardsNavigationPath(path);
  } else if (input.includes(dir)) { //rest of forward navigation
    input = input.replace(dir + '\\', '');
  } else if (dir === '\\') { // forward navigation from root
    //do nothing
  } else { // use absolute navigation
    input = '\\' + input;
  }

  return 'cd ' + input;
}

async function animateText(input, inputElement, signal) {
  await animateCursor(inputElement, 3);
  for (let i = 0; i < input.length; i++) {
    const character = input[i];
    if (inputElement.textContent.endsWith(cursorChar) || inputElement.textContent.endsWith(' ')) {
      inputElement.textContent = inputElement.textContent.slice(0, -1);
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

    i++;
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
  if (inputElement.textContent.endsWith(cursorChar)) {
    inputElement.textContent = inputElement.textContent.slice(0, -1) + ' ';
  } else {
    inputElement.textContent = inputElement.textContent.slice(0, -1) + cursorChar;
  }
}

/* #endregion */

/* #region Manage footer */
let hiddenContentElement;
let headerElement;
let mainElement;
let footerElement;

let hiddenContentHeight;
let headerHeight;
let mainHeight;
let footerHeight;

let lowerThreshold;

// to execute at start up
function setUpFooterLogic() {
  hiddenContentElement = document.getElementById("hidden-content");
  headerElement = document.getElementById('header');
  mainElement = document.querySelector("main");
  footerElement = document.getElementById("footer");

  hiddenContentHeight = hiddenContentElement.offsetHeight;
  headerHeight = headerElement.offsetHeight;
  footerHeight = footerElement.offsetHeight;

  calcProportions();
}

// to execute at window height change (or contents)
function calcProportions() {
  if (!footerHeight || !headerHeight || !hiddenContentHeight) {
    setUpFooterLogic();
  }

  lowerThreshold = window.innerHeight - footerHeight;

  const fixedElementsHeight = mainHeight + headerHeight;
  const upperThreshold = lowerThreshold - hiddenContentHeight;

  if (fixedElementsHeight >= upperThreshold || fixedElementsHeight <= lowerThreshold) {
    document.removeEventListener('touchmove', adjustFooter, { passive: true });
    document.removeEventListener("scroll", adjustFooter, { passive: true });
  }
  else {
    document.addEventListener('touchmove', adjustFooter, { passive: true });
    document.addEventListener("scroll", adjustFooter, { passive: true });
  }

  adjustFooter();
}

//to execute if needed when scrolling
function adjustFooter() {
  if (!mainElement || !lowerThreshold || !footerElement) {
    setUpFooterLogic();
  }

  const mainBottom = mainElement.getBoundingClientRect().bottom;
  if (mainBottom >= lowerThreshold) {
    footerElement.style.position = "relative";
    footerElement.style.marginTop = "0";
  } else {
    footerElement.style.position = "sticky";
    footerElement.style.marginTop = "auto";
  }
}

/* #endregion */

/* #region Load Page */
let isMobi = false;

/** Main function to load resources and managing loading screen. @async */
async function loadResources() {
  const displayAnimation = CheckDisplayAnimation();

  const loadScreenAdded = waitEvent('load-screen-added');
  window.dispatchEvent(new Event(`state-loaded`));

  const stateFormAdded = waitEvent('state-form-added');
  const headerAdded = waitEvent('header-added');
  const footerAdded = waitEvent('footer-added');
  const pageContainerAdded = waitEvent('page-container-added');

  const startTime = Date.now();
  let controller;
  const navigationType = navigationAnalizer();
  let loadingPromise;
  await loadScreenAdded;
  if (displayAnimation) {
    controller = new AbortController();
    loadingPromise = loadingAnimation(navigationType, controller.signal);
  }
  else {
    document.body.style.overflow = 'auto';
    document.getElementById('load-screen').style.display = 'none';
  }

  //start loading

  isMobile();

  await stateFormAdded;
  applyState();

  await headerAdded;
  const header = document.getElementById('header');

  header.scrollIntoView({ behavior: 'instant', block: 'start' });
  addPagePath();

  await footerAdded;
  await pageContainerAdded;
  setUpFooterLogic();
  window.addEventListener("resize", calcProportions, { passive: true });

  //end Loading

  if (displayAnimation) {
    await loadingPromise;
    if (Date.now() - startTime < 2000) {
      await new Promise(resolve => setTimeout(resolve, 5000 - (Date.now() - startTime)));
    }
    controller.abort();
    clearLoadScreen();
  }
}

function addPagePath() {
  const pagePathElement = document.getElementById('page-path');
  const path = getCurrentPath();
  if (path !== '\\') {
    const homeLink = document.createElement('a');
    homeLink.href = "";
    homeLink.textContent = 'saleca';
    pagePathElement.appendChild(homeLink);
  } else {
    pagePathElement.appendChild(document.createTextNode('saleca'));
  }
  pagePathElement.appendChild(document.createTextNode(':\\'));

  if (path !== '\\') {
    const parts = path.split('\\');
    let currentPath = '';

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

function isMobile() {
  if (/Mobi/i.test(navigator.userAgent)) {
    isMobi = true;
  }
}
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
}

/* #endregion */

loadResources();