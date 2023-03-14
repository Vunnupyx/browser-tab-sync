const CONFIGS_KEY = 'configs';
const WINDOWS_KEY = 'windows';

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

    static getWindows = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([WINDOWS_KEY], (result) => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                const researches = result.windows || {};
                resolve(researches);
            });
        });
    }

    static saveWindows = async (key, tabId) => {
        const windows = await this.getWindows()
        const updatedWindows = {...windows, [key]: tabId};
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({[WINDOWS_KEY]: updatedWindows}, () => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                resolve(updatedWindows);
            });
        });
    }

    static clearWindows = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove([WINDOWS_KEY], () => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);
                resolve();
            });
        });
    }
}
