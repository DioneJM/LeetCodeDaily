

export default class StorageSync {

    /**
     * 
     * @param {{key: value}} item - object containing item key used to set/get and value of item
     * @param {() => void=} onSet
     * @returns void 
     */
    static set(item, onSet) { // TODO refactor this to be wrapped in a promise rather than having an onSet callback
        chrome.storage.sync.set(item, function () {
            if (onSet == undefined) {
                return;
            }
            if (typeof onSet !== 'function') {
                throw new Error('onSet callback must be a function if defined, it is a: ', typeof onSet);
            }
            onSet();
        })
    }

    /**
     * 
     * @param {string} key - item key used to retrieve item from sync storage
     * @param {T=} defaultValue [defaultValue=undefined] - the default fallback value if no value is found for the associated key. If no value is provided it defaults to `undefined`
     * @returns {T} item
     */
    static getAsync(key, defaultValue) {
        return new Promise(
            (resolve, reject) => {
                let item = defaultValue || undefined;
                const getCallback = (result) => {
                    if (result && result[key]) {
                        resolve(result[key]);
                    } else {
                        resolve(defaultValue || undefined);
                    }
                }
                chrome.storage.sync.get(key, getCallback);
            }
        )

    }

    static removeAsync(key) {
        return new Promise(
            (resolve, reject) => {
                chrome.storage.sync.remove('webRedirect', function () {
                    resolve();
                });
            }
        )
    }
}