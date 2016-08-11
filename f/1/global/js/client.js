(function(window, undefined) {

  if (/\bMSIE 6/.test(navigator.userAgent) && !window['opera']) {
    return;
  }

  if (isOldBrowser()) {
    return;
  }

  
/**
 * @enum {string}
 */
var LivetexSettings = {
  BALANCER: '//balancer-cloud.livetex.ru',
};



  if (typeof LiveTex !== 'undefined' &&
      typeof LiveTex['liveTexID'] !== 'undefined') {
    window['liveTexID'] = LiveTex['liveTexID'];
  }

  window['LTX_VERSION'] = '1.0.7';

  /* %%API%%
  if (typeof window['LTX_IS_API'] === 'undefined') {
    window['LTX_IS_API'] = true;
  }
  */ // %%API%%

  function isOldBrowser() {
    var ua = window.navigator.userAgent;
    var versionReg = new RegExp('version\/(\\d+(\\.\\d+)?)', 'i');
    var msReg = new RegExp('(?:msie |rv:)(\\d+(\\.\\d+)?)', 'i');
    var operaReg = new RegExp('(?:opera|opr)[\\s\/](\\d+(\\.\\d+)?)', 'i');

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    var versionIdentifier = getFirstMatch(versionReg);

    if (/msie|trident/i.test(ua)) {
      return (getFirstMatch(msReg) < 7 || document.compatMode !== 'CSS1Compat');
    }

    if (/opera|opr/i.test(ua)) {
      var version = versionIdentifier || getFirstMatch(operaReg);
      return version < 12;
    }

    return false;
  }

  function nop() {}

  function loadAppJs() {

    function completeHandler() {
      script.onreadystatechange = nop;
      script.onload = nop;
      document.body.removeChild(script);
    }

    function random() {
      return Math.random().toString(36).substr(2);
    };

    var script = document.createElement('script');
    script.onreadystatechange = function() {
      if (script.readyState === 'complete' ||
          script.readyState === 'loaded') {
        completeHandler();
      }
    };

    script.onload = completeHandler;
    script.src = LivetexSettings['BALANCER'] + '/get-client/?site_id=' +
        liveTexID.toString() + '&version=' + LTX_VERSION + '&rnd=' + random();
    document.body.appendChild(script);
  }

  if (/Opera Mini/.test(navigator.userAgent)) return false;

  if (typeof window['LiveTex'] === 'undefined') {
    window['LiveTex'] = {};
  }

  if (window['LiveTex']['is_init'] !== true) {
    window['LiveTex']['is_init'] = true;
    loadAppJs();
  } else {
    if (typeof console !== 'undefined' &&
        typeof console.error !== 'undefined') {
      console.error('LiveTex script loaded two or more times. ' +
          'Load the script only once, please.');
    }
  }
})(window);
