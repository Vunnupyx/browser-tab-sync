const TAB_MAIN = 'ORIGINAL_TAB'

let background = {
    config: {},
    tabs: {},
    keysOfSyncedTabs: [],

    init: function () {
        this.loadConfig().then(() => StorageService.clearTabs());

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.fn in background) {
                background[request.fn](request, sender, sendResponse);
            }
        })
    },

    loadConfig: async function () {
        this.config = await StorageService.getConfigs();
    },

    setConfig: async function (request) {
        this.config = await StorageService.saveConfigs(request.config);
    },

    isTabAlreadyOpen: async function (tabId, url) {
        return new Promise((resolve) => {
            chrome.tabs.get(tabId, async (tab) => {
                if (chrome.runtime.lastError) {
                    resolve(false);
                }
                resolve(tab && tab.url === url);
            })
        })
    },

    updateTab: async function (key, url) {
        return new Promise(async (resolve) => {
            if (this.tabs.hasOwnProperty(key)) {
                const isTabAlreadyOpen = await this.isTabAlreadyOpen(this.tabs[key], url);
                if (!isTabAlreadyOpen) {
                    chrome.tabs.update(this.tabs[key], {url}, () => {
                        if (chrome.runtime.lastError)
                            chrome.tabs.create({url, active: false}, (res) => {
                                resolve(StorageService.saveTabs(key, res.id));
                            })
                        else {
                            resolve(this.tabs);
                        }
                    })
                } else {
                    resolve(this.tabs);
                }
            } else {
                chrome.tabs.create({url, active: false}, (res) => {
                    resolve(StorageService.saveTabs(key, res.id));
                })
            }
        })
    },

    openTabs: async function (request, sender) {
        if (sender.tab.active) {
            this.keysOfSyncedTabs = [];
            chrome.tabs.onUpdated.removeListener(this.handleTabSync);

            this.tabs = await StorageService.saveTabs(TAB_MAIN, sender.tab.id);
            for (const key in this.config) {
                if (this.config.hasOwnProperty(key)) {
                    const tab = this.config[key];
                    const escapeSourceUrl = tab.sourcePattern?.replace(/[/\-\\^$*+?.()|[\]]/g, '\\$&');
                    const sourceUrlRegex = escapeSourceUrl?.replace(/[{0}]+/, '(\\d+)');
                    const idSourceUrl = request.documentURL.match(sourceUrlRegex);
                    if (idSourceUrl && idSourceUrl[1] && tab.mapping.hasOwnProperty(idSourceUrl[1])) {
                        const targetUrl = tab.targetPattern.replace(/[{0}]+/, tab.mapping[idSourceUrl[1]]);
                        this.tabs = await this.updateTab(key, targetUrl);
                        if (tab.hasOwnProperty('browserTabSyncMode'))
                            this.keysOfSyncedTabs.push(key);
                    }
                }
            }
            chrome.tabs.onUpdated.addListener(this.handleTabSync);
        }
    },

    //remove listener when close tab
    handleTabSync: function (tabId, changeInfo) {
        if (
            !background.keysOfSyncedTabs ||
            background.keysOfSyncedTabs.length === 0
        )
            chrome.tabs.onUpdated.removeListener(this.handleTabSync);

        chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
            for (const key of background.keysOfSyncedTabs) {
                if (
                    changeInfo.url === tab?.url &&
                    tab &&
                    background.tabs[key] === tab.id
                ) {
                    await background.updateMainTab(tab.url, key);
                }
            }
        });
    },

    updateMainTab: async function (windowUrl, key) {
        if (this.config.hasOwnProperty(key)) {
            const tab = this.config[key];
            const escapeTargetUrl = tab.targetPattern?.replace(/[/\-\\^$*+?.()|[\]]/g, '\\$&');
            const targetUrlRegex = escapeTargetUrl?.replace(/[{0}]+/, '(\\w+)');
            const idTargetUrl = windowUrl.match(targetUrlRegex);

            if (idTargetUrl && idTargetUrl[1]) {
                const tabsId = Object.keys(tab.mapping).find(
                    (key) => tab.mapping[key] === idTargetUrl[1]
                );

                if (tabsId) {
                    const sourceUrl = tab.sourcePattern.replace(/[{0}]+/, tabsId);
                    this.tabs = await this.updateTab(TAB_MAIN, sourceUrl);
                }

            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    background.init();
});
