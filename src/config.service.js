const CONFIGS_KEY = 'configs';

class ConfigService {

    static getConfigs = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([CONFIGS_KEY], (result) => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);

                const researches = result.configs ?? [];
                resolve(researches);
            });
        });
    }

    static saveConfigs = async (configs) => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [CONFIGS_KEY]: configs }, () => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);
                resolve(configs);
            });
        });
    }
}