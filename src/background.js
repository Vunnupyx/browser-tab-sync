const TAB_MAIN = 'ORIGINAL_TAB'

let background = {
    config: {},
    tabs: {},

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

    loadTab: async function (request, sender) {
        if (sender.tab.active) {
            this.openTargetTabs(request.documentURL).then(async (isTabsReloaded) => {
                if (isTabsReloaded) {
                    this.tabs = await StorageService.saveTabs(TAB_MAIN, sender.tab.id);
                } else {
                    await this.openSourceTab(request.documentURL, sender.tab.id);
                }
            })
        }
    },

    openSourceTab: async function (tabUrl, tabId) {
        for (const key in this.config) {
            const tab = this.config[key];
            if (this.config.hasOwnProperty(key) && tab.hasOwnProperty('browserTabSyncMode')) {
                const escapeTargetUrl = tab.targetUrl?.replace(/[/\-\\^$*+?.()|[\]]/g, '\\$&');
                const targetUrlRegex = escapeTargetUrl?.replace(/{TID}/, '(\\w+)');
                const idTargetUrl = tabUrl.match(targetUrlRegex);

                if (idTargetUrl && idTargetUrl[1]) {
                    const tabsId = Object.keys(tab.repl).find(
                        (key) => tab.repl[key].to === idTargetUrl[1]
                    );

                    if (tabsId) {
                        const sourceUrl = tab.sourceUrl.replace(/{TID}/, tabsId);
                        await this.updateTab(TAB_MAIN, sourceUrl);
                        this.tabs = await StorageService.saveTabs(key, tabId);
                        return;
                    }
                }
            }
        }
    },

    openTargetTabs: async function (tabUrl) {
        let isTabsReloaded = false;
        for (const key in this.config) {
            if (this.config.hasOwnProperty(key)) {
                const tab = this.config[key];
                const escapeSourceUrl = tab.sourceUrl?.replace(/[/\-\\^$*+?.()|[\]]/g, '\\$&');
                const sourceUrlRegex = escapeSourceUrl?.replace(/{TID}/, '(\\d+)');
                const idSourceUrl = tabUrl.match(sourceUrlRegex);

                if (idSourceUrl && idSourceUrl[1] && tab.repl.hasOwnProperty(idSourceUrl[1])) {
                    const targetUrl = tab.targetUrl.replace(/{TID}/, tab.repl[idSourceUrl[1]].to);
                    this.tabs = await this.updateTab(key, targetUrl);
                    isTabsReloaded = true;
                }
            }
        }
        return isTabsReloaded;
    },
};

document.addEventListener('DOMContentLoaded', () => {
    background.init();
});
