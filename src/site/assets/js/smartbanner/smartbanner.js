// Pulled from SmartBanner JS
// https://github.com/ain/smartbanner.js/tree/main/src

const DEFAULT_PLATFORMS = 'android,ios';
const DEFAULT_CLOSE_LABEL = 'Close';
const DEFAULT_BUTTON_LABEL = 'View';
let smartbanner;

const datas = {
  originalTop: 'data-smartbanner-original-top',
  originalMarginTop: 'data-smartbanner-original-margin-top',
};

class Bakery {
  static getCookieExpiresString(hideTtl) {
    const now = new Date();
    const expireTime = new Date(now.getTime() + hideTtl);

    return `expires=${expireTime.toGMTString()};`;
  }

  static bake(hideTtl, hidePath) {
    document.cookie = `smartbanner_exited=1; ${
      hideTtl ? Bakery.getCookieExpiresString(hideTtl) : ''
    } path=${hidePath}`;
  }

  static unbake() {
    document.cookie =
      'smartbanner_exited=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  static get baked() {
    const value = document.cookie.replace(
      /(?:(?:^|.*;\s*)smartbanner_exited\s*=\s*([^;]*).*$)|^.*$/,
      '$1',
    );

    return value === '1';
  }
}

class Detector {
  static platform() {
    const { maxTouchPoints } = window.navigator;
    const { userAgent } = window.navigator;

  if(userAgent.match((/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/))) {
    if (/Android/i.test(userAgent)) {
      return 'android';
    }

    if (
      (!window.MSStream &&
        !/X11|Linux/i.test(userAgent) &&
        maxTouchPoints &&
        maxTouchPoints > 0) ||
      /iPhone|iPad|iPod/i.test(userAgent)
    ) {
      return 'ios';
    }
  } else {
    return null;
  }    

}

  static userAgentMatchesRegex(regexString) {
    return new RegExp(regexString).test(window.navigator.userAgent);
  }

  static wrapperElement() {
    return document.querySelectorAll('html');
  }
}

function valid(name) {
  return name.indexOf('smartbanner:') !== -1 && name.split(':')[1].length > 0;
}

function convertToCamelCase(name) {
  const parts = name.split('-');

  parts.forEach((part, index) => {
    if (index > 0) {
      parts[index] = part.charAt(0).toUpperCase() + part.substring(1);
    }
  });

  return parts.join('');
}

class OptionParser {
  parse() {
    let metas = document.getElementsByTagName('meta');
    const options = {};

    Array.apply(null, metas).forEach(function(meta) {
      let optionName = null;
      const name = meta.getAttribute('name');
      const content = meta.getAttribute('content');

      if (name && content && valid(name) && content.length > 0) {
        optionName = name.split(':')[1];

        if (optionName.indexOf('-') !== -1) {
          optionName = convertToCamelCase(optionName);
        }

        options[optionName] = content;
      }
    });

    return options;
  }
}

function handleExitClick(event, self) {
  self.exit();
  event.preventDefault();
}

function handleClickout(event, self) {
  self.clickout();
}

function setContentPosition(value) {
  const wrappers = Detector.wrapperElement();

  for (let i = 0, l = wrappers.length, wrapper; i < l; i++) {
    wrapper = wrappers[i];

  if (!wrapper?.getAttribute(datas?.originalMarginTop)) {
      const margin = parseFloat(getComputedStyle(wrapper).marginTop);

      wrapper.setAttribute(
        datas.originalMarginTop,
        Number.isNaN(margin) ? 0 : margin,
      );

      wrapper.style.marginTop = `${value}px`;
    }
  }
}

function addEventListeners(self) {
  const closeIcon = document.querySelector('.js_smartbanner__exit');
  closeIcon.addEventListener('click', event => handleExitClick(event, self));

  const button = document.querySelector('.js_smartbanner__button');
  button.addEventListener('click', event => handleClickout(event, self));
}

function restoreContentPosition() {
  const wrappers = Detector.wrapperElement();

  for (let i = 0, l = wrappers.length, wrapper; i < l; i++) {
    wrapper = wrappers[i];

    if (
      wrapper.getAttribute(datas.originalTop)
    ) {
      wrapper.style.top = `${wrapper.getAttribute(datas.originalTop)}px`;
    } else if (wrapper.getAttribute(datas.originalMarginTop)) {
      wrapper.style.marginTop = `${wrapper.getAttribute(
        datas.originalMarginTop,
      )}px`;
    }
  }
}

class SmartBanner {
  constructor() {
    const parser = new OptionParser();
    this.options = parser.parse();
    this.platform = Detector.platform();

    const event = new Event('smartbanner.init');
    document.dispatchEvent(event);
  }

  get priceSuffix() {
    if (this.platform === 'ios' && this.options.priceSuffixApple) {
      return this.options.priceSuffixApple;
    }
    
    if (this.platform === 'android' && this.options.priceSuffixGoogle) {
      return this.options.priceSuffixGoogle;
    }

    return '';
  }

  get price() {
    if (this.options.price && this.options.price !== '') {
      return this.options.price;
    }

    return '';
  }

  get icon() {
    if (this.platform === 'android') {
      return this.options.iconGoogle;
    }

    return this.options.iconApple;
  }

  get buttonUrl() {
    if (this.platform === 'android') {
      return '/img/Android_app_icon.webp';
    }

    if (this.platform === 'ios') {
      return '/img/iOS_app_icon.webp';
    }
    return '#';
  }

  get closeLabel() {
    return this.options.closeLabel !== undefined
      ? this.options.closeLabel
      : DEFAULT_CLOSE_LABEL;
  }

  get buttonLabel() {
    let buttonLabel = this.options.button;

    if (this.platform === 'android' && this.options.buttonGoogle) {
      buttonLabel = this.options.buttonGoogle;
    } else if (this.platform === 'ios' && this.options.buttonApple) {
      buttonLabel = this.options.buttonApple;
    }

    return buttonLabel || DEFAULT_BUTTON_LABEL;
  }

  get html() {
    const modifier = !this.options.customDesignModifier
      ? this.platform
      : this.options.customDesignModifier;

    return `<div class="smartbanner smartbanner--${modifier} js_smartbanner">
      <a href="javascript:void(0);" class="smartbanner__exit js_smartbanner__exit" aria-label="${this.closeLabel}"></a>
      <div class="smartbanner__icon" style="background-image: url(${this.icon});"></div>
      <div class="smartbanner__info">
        <div>
          <div class="smartbanner__info__title">${this.options.title}</div>
          <div class="smartbanner__info__author">${this.options.author}</div>
          <div class="smartbanner__info__price">${this.price}${this.priceSuffix}</div>
        </div>
      </div>
      <a href="${this.buttonUrl}" target="_blank" class="smartbanner__button js_smartbanner__button" rel="noopener" aria-label="${this.buttonLabel}"><span class="smartbanner__button__label">${this.buttonLabel}</span></a>
    </div>`;
  }

  get height() {
    try {
      return document.querySelector('.js_smartbanner').offsetHeight;
    } catch (error) {
      return 0;
    }
  }

  get platformEnabled() {
    const enabledPlatforms = this.options.enabledPlatforms || DEFAULT_PLATFORMS;

    return (
      enabledPlatforms &&
      enabledPlatforms
        .replace(/\s+/g, '')
        .split(',')
        .indexOf(this.platform) !== -1
    );
  }

  get positioningDisabled() {
    return this.options.disablePositioning === 'true';
  }

  get apiEnabled() {
    return this.options.api === 'true';
  }

  get userAgentExcluded() {
    if (!this.options.excludeUserAgentRegex) {
      return false;
    }

    return Detector.userAgentMatchesRegex(this.options.excludeUserAgentRegex);
  }

  get userAgentIncluded() {
    if (!this.options.includeUserAgentRegex) {
      return false;
    }

    return Detector.userAgentMatchesRegex(this.options.includeUserAgentRegex);
  }

  get hideTtl() {
    return this.options.hideTtl ? parseInt(this.options.hideTtl, 10) : false;
  }

  get hidePath() {
    return this.options.hidePath ? this.options.hidePath : '/';
  }

  publish() {
    if (Object.keys(this.options).length === 0) {
      throw new Error('No options detected. Please consult documentation.');
    }

    if (Bakery.baked) {
      return false;
    }

    // User Agent was explicetely excluded by defined excludeUserAgentRegex
    if (this.userAgentExcluded) {
      return false;
    }

    // User agent was neither included by platformEnabled,
    // nor by defined includeUserAgentRegex
    if (!(this.platformEnabled || this.userAgentIncluded)) {
      return false;
    }

    const bannerDiv = document.createElement('div');
    document.querySelector('body').prepend(bannerDiv);
    bannerDiv.outerHTML = this.html;

    const event = new Event('smartbanner.view');
    document.dispatchEvent(event);

    if (!this.positioningDisabled) {
      setContentPosition(this.height);
    }

    addEventListeners(this);

    return null;
  }

  exit() {
    if (!this.positioningDisabled) {
      restoreContentPosition();
    }

    const banner = document.querySelector('.js_smartbanner');
    document.querySelector('body').removeChild(banner);

    const event = new Event('smartbanner.exit');
    document.dispatchEvent(event);

    Bakery.bake(this.hideTtl, this.hidePath);
  }

  clickout() {
    const event = new Event('smartbanner.clickout');
    document.dispatchEvent(event);
  }
}

window.addEventListener('load', function() {
  smartbanner = new SmartBanner();

  if (smartbanner.apiEnabled) {
    window.smartbanner = smartbanner;
  } else {
    smartbanner.publish();
  }
});