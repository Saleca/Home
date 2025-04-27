
const version = '0.4';
const cursorChar = '█';
const writeSpeedMS = 50;
const writeSpeedVariationMS = 150;
const writeHoldMS = 200;
const cursorSpeedMS = 400;

/** Manages the loading animation. */
function commitMessage() {
  return fetch(`https://api.github.com/repos/saleca/home/commits?per_page=1`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.length > 0) {
        const lastCommit = data[0];
        return lastCommit.commit.message; // Return the message to resolve the Promise
      } else {
        console.warn("No commits found in the repository.");
        return 'Unknown Commit'; // Return a default value if no commits
      }
    })
    .catch(error => {
      console.error("Error fetching last commit:", error);
      return 'Error fetching commit'; // Return an error message
    });
}

async function loadingAnimation(navigationType, signal) {
  const loadScreenElement = document.createElement('div');
  loadScreenElement.id = 'load-screen';
  document.body.insertBefore(loadScreenElement, document.body.firstChild);

  await startConsole(loadScreenElement);
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

async function startConsole(loadScreenElement) {
  const start = document.createElement('p');
  const message = await commitMessage();
  start.textContent = `Saleca Portfolio [Version ${version}] | ${message}`;
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

window.dispatchEvent(new Event(loadingEvents.CONSOLE_ANIM_SCRIPT));