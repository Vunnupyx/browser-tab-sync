const TAB_MAIN = 'ORIGINAL_TAB';

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

    openTargetTabs: async function (tabUrl) {
        let isTabsReloaded = false;
        for (const key in this.config) {
            if (this.config.hasOwnProperty(key)) {
                const tab = this.config[key];
                const escapeSourceUrl = this.escapeStringRegexp(tab.sourceUrl);
                const sourceUrlRegex = this.replacePathFromURL(escapeSourceUrl, '(\\d+)');
                const idSourceUrl = tabUrl.match(sourceUrlRegex);

                if (idSourceUrl && idSourceUrl[1] && tab.repl.hasOwnProperty(idSourceUrl[1])) {
                    const targetUrl = this.replacePathFromURL(tab.targetUrl, tab.repl[idSourceUrl[1]].to);
                    this.tabs = await this.openTab(key, targetUrl);
                    isTabsReloaded = true;
                }
            }
        }
        return isTabsReloaded;
    },

    openSourceTab: async function (tabUrl, tabId) {
        for (const key in this.config) {
            const tab = this.config[key];
            if (this.config.hasOwnProperty(key) && tab.hasOwnProperty('browserTabSyncMode')) {
                const escapeTargetUrl = this.escapeStringRegexp(tab.targetUrl);
                const targetUrlRegex = this.replacePathFromURL(escapeTargetUrl, '(\\w+)');
                const idTargetUrl = tabUrl.match(targetUrlRegex);

                if (idTargetUrl && idTargetUrl[1]) {
                    const tabsId = Object.keys(tab.repl).find(
                        (key) => tab.repl[key].to === idTargetUrl[1]
                    );

                    if (tabsId) {
                        const sourceUrl = this.replacePathFromURL(tab.sourceUrl, tabsId);
                        await this.openTab(TAB_MAIN, sourceUrl);
                        this.tabs = await StorageService.saveTabs(key, tabId);
                        return;
                    }
                }
            }
        }
    },

    openTab: async function (key, url) {
        if (this.tabs.hasOwnProperty(key)) {
            const isTabAlreadyOpen = await this.isTabAlreadyOpen(this.tabs[key], url)
            if (isTabAlreadyOpen)
                return this.tabs;

            return this.updateTab(key, url)
                .then((tabs) => {
                    return tabs
                })
                .catch(() => {
                    return this.createTab(key, url)
                })
        } else {
            return this.createTab(key, url);
        }
    },

    createTab: async function (key, url) {
        return new Promise((resolve) => {
            chrome.tabs.create({url, active: false}, (res) => {
                resolve(StorageService.saveTabs(key, res.id));
            })
        })
    },

    updateTab: async function (key, url) {
        return new Promise((resolve, reject) => {
            chrome.tabs.update(this.tabs[key], {url}, () => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);
                resolve(this.tabs);
            })
        })
    },

    isTabAlreadyOpen: async function (tabId, url) {
        return new Promise((resolve) => {
            chrome.tabs.get(tabId, (tab) => {
                if (chrome.runtime.lastError) {
                    resolve(false);
                }
                resolve(tab && tab.url === url);
            })
        })
    },

    escapeStringRegexp: function (str) {
        if (typeof str !== 'string') {
            return;
        }
        return str.replace(/[/\-\\^$*+?.()|[\]]/g, '\\$&');
    },

    replacePathFromURL: function (str, val) {
        if (typeof str !== 'string') {
            return;
        }
        return str.replace(/{TID}/, val);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    background.init();
});
