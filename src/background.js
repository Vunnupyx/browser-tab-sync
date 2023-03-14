let background = {
    config: {},

    init: function () {
        this.loadConfig().then(() => StorageService.clearWindows())

        chrome.tabs.onUpdated.addListener(function
                (tabId, changeInfo, tab) {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, (tabs) => {
                    if (changeInfo.url && tabId === tabs[0].id) {
                        console.log("Only Current TAB");
                    }
                })
            }
        );
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.fn in background) {
                background[request.fn](request, sender, sendResponse);
            }
        })
    },

    loadConfig: async function () {
        this.config = await StorageService.getConfigs()
    },

    setConfig: async function (request) {
        this.config = await StorageService.saveConfigs(request.config);
    },

    updateTab: async function (key, url) {
        const windows = await StorageService.getWindows();
        if (windows.hasOwnProperty(key)) {
            chrome.tabs.update(windows[key], {url}, () => {
                if (chrome.runtime.lastError)
                    chrome.tabs.create({url}, (res) => {
                        StorageService.saveWindows(key, res.id)
                    })
            })
        } else {
            chrome.tabs.create({url}, (res) => {
                StorageService.saveWindows(key, res.id)
            })
        }

    },

    openTabs: async function (request) {
        for (const key in this.config) {
            if (this.config.hasOwnProperty(key)) {
                const tab = this.config[key];
                const escapeSourceUrl = tab.sourcePattern?.replace(/[/\-\\^$*+?.()|[\]]/g, '\\$&')
                const sourceUrlRegex = escapeSourceUrl?.replace(/[{0}]+/, '(\\d+)');
                const idSourceUrl = request.documentURL.match(sourceUrlRegex);
                if (idSourceUrl && idSourceUrl[1] && tab.mapping.hasOwnProperty(idSourceUrl[1])) {
                    const targetUrl = tab.targetPattern.replace(/[{0}]+/, tab.mapping[idSourceUrl[1]])
                    await this.updateTab(key, targetUrl)
                }
            }
        }
    },
};

document.addEventListener('DOMContentLoaded', () => {
    background.init();
});
