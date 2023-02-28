let background = {
    config: {},

    init: function () {
        this.loadConfig().then(() => this.openTabs());

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.fn in background) {
                background[request.fn](request, sender, sendResponse);
            }
        })
    },

    loadConfig: async function () {
        this.config = await ConfigService.getConfigs()
    },

    setConfig: async function (request) {
        this.config = await ConfigService.saveConfigs(request.config);
    },

    openTabs: function () {
        for (const key in this.config) {
            if (this.config.hasOwnProperty(key)) {
                const tab = this.config[key];
                const escapeSourceUrl = tab.sourcePattern.replace(/[/\-\\^$*+?.()|[\]]/g, '\\$&')
                const sourceUrlRegex = escapeSourceUrl.replace(/[{0}]+/, '(\\d+)');
                const idSourceUrl = document.URL.match(sourceUrlRegex);
                if (idSourceUrl && idSourceUrl[1] && tab.mapping.hasOwnProperty(idSourceUrl[1])) {
                    const targetUrl = tab.targetPattern.replace(/[{0}]+/, tab.mapping[idSourceUrl[1]])
                    window.open(targetUrl, key);
                }
            }
        }
    },
};

document.addEventListener('DOMContentLoaded', () => {
    background.init();
});
