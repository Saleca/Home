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
function navigationManager()
{
  const navEntries = performance.getEntriesByType('navigation');
  if (navEntries.length > 0) {
    switch (navEntries[0].type) {
      case 'back_forward':
      case 'reload':
        return NavigationType.RELOAD;
      case 'navigate':
        const referrer = document.referrer;
        const currentDomain = window.location.origin;

        if((!referrer || referrer === '')
          || (referrer && !referrer.startsWith(currentDomain))) {
          clearNavigationStack();
          return NavigationType.EXTERNAL;;
        }

        let url = window.location.href.replace(/^.*www\./, '');
        if(!url)
        {
          url = window.location.href.replace(/^.*127\.0\.0\.1:5500\//, '');;
        }

        if(!url || url === 'index.html')
        {
          url = '/';
        }

        addUrlToNavigationStack(url);

        return NavigationType.INTERNAL;;
    }
  }
}

/** Adds URL to navigation stack. */
function addUrlToNavigationStack(url = '/') {
  let navigationStack = JSON.parse(localStorage.getItem('navigation-stack')) || [];
  
  navigationStack.push(url);
  
  localStorage.setItem('navigation-stack', JSON.stringify(navigationStack));
}

/** Clears navigation stack. */
function clearNavigationStack(){
  localStorage.removeItem('navigation-stack');
}

/** @returns All items from the navigation stack. */
function getAllNavigationItems() {
  let navigationStack =  JSON.parse(localStorage.getItem('navigation-stack')) || [];
  if(navigationStack.length === 0) {
    addUrlToNavigationStack();
    navigationStack =  JSON.parse(localStorage.getItem('navigation-stack')) || [];
  }

  for(let i = 0; i<navigationStack.length; i++)
  {
    console.error(navigationStack[i]);
  }

  return navigationStack;
}

/* #endregion */

/* #region Animation */

const cursorChar = '█';

/** Manages the loading animation. */
function loadingAnimation(loadType, signal) {
  const loadScreenElement = document.getElementById('load-screen');

  const navigationStack = getAllNavigationItems();
  if(navigationStack.length > 2) {
    fillNavigationHistoryElement(navigationStack.slice(0, -1), loadScreenElement);
  }
  const pElement = document.createElement('p');
  const urlTextElement = document.createElement('span');
  const textAnimationElement = document.createElement('span');
  pElement.append(urlTextElement, document.createTextNode(' > '), textAnimationElement);
  loadScreenElement.append(pElement);

  if(loadType === NavigationType.INTERNAL)
  {
    if(navigationStack.length >= 2) {
      urlTextElement.textContent = navigationStack[navigationStack.length-2];
      animateText(navigationStack[navigationStack.length-1], textAnimationElement, signal)
    }
    else {
      console.error('invalid navigationStack length')
    }
  }
  else { //if external or reload
    if(navigationStack.length > 0) {
      urlTextElement.textContent = navigationStack[0];
      threeDotsAnimation(textAnimationElement, signal);
    }
    else {
      console.error('invalid navigationStack length')
    }
  }
}

function fillNavigationHistoryElement(navigationStack, loadScreenElement)
{
  let text = '';
  const length = navigationStack.length-1;
  for (let i = 1; i < length; i++) {
    text += `${navigationStack[i-1]} > ${navigationStack[i]}\n`;
    const p = document.createElement('p');
    p.textContent = text;
    loadScreenElement.append(p);
  }
}

async function animateText(text, textAnimationElement, signal)
{
  await animateCursor(textAnimationElement, 3);
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if(textAnimationElement.textContent. includes(cursorChar) {
      textAnimationElement.textContent = textAnimationElement.textContent. replace(cursorChar, '');
    }
    textAnimationElement.textContent += character + cursorChar;
    if(character === '/') {
      await animateCursor(textAnimationElement, 1);
    }
    else {
      await delay(100 + Math.random() * 200)
    }
  }

  if(!signal.aborted)
  {
    threeDotsAnimation(textAnimationElement, signal, text);
  }
}

/** Helper function to simulate input. 
 * @async
 * @param {AbortSignal} signal - The signal to control the abortion of the animation.
 */
async function threeDotsAnimation(textAnimationElement, signal, defaultText = '')
{
  let i = 0;
  while(!signal.aborted) {
    let textAnimation = defaultText;
    switch (i) {
      case 0:
        await animateCursor(3, );
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
    if(i > 3)
    {
      i = 0;
    }
  }
}

/** Helper function to delay execution. 
 * @async
 * @param {Number} ms - The delay time in miliseconds.
 */
async function delay(ms)
{
  await new Promise(resolve => setTimeout(resolve, ms));
}

/** Animates the cursor
* @param {HTMLSpanElement} textAnimationElement element where the cursor is animated. 
* @param {Number} n number of times the cursor is animated.
*/
async function animateCursor(textAnimationElement, n)
{
  for (let b = 0; b < n; b++) {
    await delay(500);
    blinkCursor();
  }

  /** Switches the state of the cursor */
  function blinkCursor()
  {
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
async function loadResources()
{
  const startTime = Date.now();
  const controller = new AbortController();
  const loadType = navigationManager();
  loadingAnimation(loadType, controller.signal);
  await addStateForm();
  applyState();
  if (Date.now() - startTime < 2000) {
    await new Promise(resolve => setTimeout(resolve, 5000 - (Date.now() - startTime)));
  }

  controller.abort();
  clearLoadScreen();
}

/** Adds the 'state-form.html' to the element with the ID 'state-form' at start up. @async */
async function addStateForm()
{
  await fetch('state-form.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('state-form')
        .innerHTML = data;
    })
    .catch(error => console.error('Error fetching state form:', error));
}

/** When loading is complete clears the loading screen. */
function clearLoadScreen()
{
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