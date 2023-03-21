const CONFIGS_KEY = 'configs';
const TABS_KEY = 'tabs';

class StorageService {

    static getConfigs = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([CONFIGS_KEY], (result) => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);

                const researches = result.configs ?? [];
                resolve(researches);
            });
        });
    }

    static saveConfigs = async (configs) => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({[CONFIGS_KEY]: configs}, () => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                resolve(configs);
            });
        });
    }

    static getTabs = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([TABS_KEY], (result) => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                const researches = result.tabs || {};
                resolve(researches);
            });
        });
    }

    static saveTabs = async (key, tabId) => {
        const tabs = await this.getTabs()
        const updatedTabs = {...tabs, [key]: tabId};
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({[TABS_KEY]: updatedTabs}, () => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                resolve(updatedTabs);
            });
        });
    }

    static clearTabs = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove([TABS_KEY], () => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);
                resolve();
            });
        });
    }
}
