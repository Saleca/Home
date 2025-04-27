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

setUpFooterLogic();
window.addEventListener("resize", calcProportions, { passive: true });
