let background = {
  config: {},
  windows: {},

  init: function () {
    this.loadConfig();
    this.openTabs();

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.fn in background) {
        console.log(request.fn)
        background[request.fn](request, sender, sendResponse);
      }
    })
  },

  loadConfig: function () {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        background.config = JSON.parse(xhr.response)
        console.log(background.config)
      }
    }
    xhr.open("GET", chrome.extension.getURL("config.json"), false)
    xhr.send()
  },

  setConfig: function (request, sender, sendResponse) {
    console.log(request)
    this.config = request.config;
  },

  openTabs: function () {
    for(const key in background.config){
      if (background.config.hasOwnProperty(key)){
        const tab = background.config[key];
        const idSourceUrl = document.URL.match(/\/issues\/(\d+)/);

        if(idSourceUrl && idSourceUrl[1] && tab.mapping.hasOwnProperty(idSourceUrl[1])){
          const targetUrl = tab.targetPattern.replace(/[{0}]+/, tab.mapping[idSourceUrl[1]])

          //not work
          if (this.windows.hasOwnProperty(key)) {
            this.windows[key].location.replace("")
          } else {
            this.windows[key] = window.open(targetUrl, key);
          }
        }
      }
    }
  }
};
document.addEventListener('DOMContentLoaded', () => {
  background.init();
});
