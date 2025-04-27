function resizePage() {
  var resizable = document.getElementById("resizable");
  var footer = document.getElementById("footer");
  resizable.style.minHeight = "";

  var minHeight = window.innerHeight - footer.offsetHeight;

  //check why size is not working
  if (minHeight >= resizable.offsetHeight-10) {
    console.log("resizing");
    var hiddenContent = document.getElementById("hidden-content");
    resizable.style.minHeight = (minHeight + hiddenContent.offsetHeight+1).toString() + "px";
    scrollToTop();
  }
}

function scrollToTop() {
  var header = document.getElementById("header");
  header.scrollIntoView({ behavior: 'instant', block: 'start' });
}

window.dispatchEvent(new Event(loadingEvents.FOOTER_SCRIPT));
window.addEventListener("resize", (e) => resizePage());