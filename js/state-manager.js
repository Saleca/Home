const Languages = {
  ENGLISH: 'en',
  PORTUGUESE: 'pt'
};

const Themes = {
  LIGHT: 'light',
  DEVICE: 'device',
  DARK: 'dark'
};

const Animation = {
  NONE: 'none',
  AUTO: 'auto'
};

const UserPref = {
  THEME: Themes,
  LANG: Languages,
  ANIM: Animation
};

function getKeyType(key) {
  return Object.keys(UserPref).find(k => UserPref[k] === key);
}

function setLanguage(language) {
  document.documentElement.lang = language;
  storeItem(language)
}

function storeItem(item) {
  let typeString = Object.keys(UserPref).find(key => Object.values(UserPref[key]).includes(item));

  if (!typeString) {
    console.error(`Invalid item`);
    return;
  }
  localStorage.setItem(typeString, item);
}

function getSetAnimationPreference(anim){
  const animType = getKeyType(UserPref.ANIM);
  if (anim) {
    localStorage.setItem(animType, anim);
  }
  else {
    anim = localStorage.getItem(animType) || Animation.AUTO;
  }
  return anim;
}

/** Configures the state of the page at start up. */
function applyState(lang, theme) {
  const langType = getKeyType(UserPref.LANG);
  if (lang) {
    localStorage.setItem(langType, lang);
  }
  else {
    lang = localStorage.getItem(langType) || Languages.ENGLISH;
  }
  
  document.documentElement.lang = lang;
  document.getElementById(lang).checked = true;

  const themeType = getKeyType(UserPref.THEME);
  if (theme) {
    localStorage.setItem(themeType, theme);
  }
  else {
    theme = localStorage.getItem(themeType) || Themes.DEVICE;
  }
  document.getElementById(theme).checked = true;
}

window.dispatchEvent(new Event(loadingEvents.STATE_SCRIPT));