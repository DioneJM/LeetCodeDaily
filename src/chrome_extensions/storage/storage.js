

export default class StorageSync {

    /**
     * Asynchronously stores `value` under specified `key`
     * @param {{key: value}} item - object containing item key/value pair
     * @returns void 
     */
    static async set(item, onSet) {
        return new Promise(
            (resolve, reject) => {
                chrome.storage.sync.set(item, function () {
                    resolve();
                })
            }
        )
    }

    /**
     * Asynchronously retrieves item using specified key. A default value can also be specified which will be returned when the item is unable to be found.
     * @param {string} key - item key used to retrieve item from sync storage
     * @param {T=} defaultValue [defaultValue=undefined] - the default fallback value if no value is found for the associated key. If no value is provided it defaults to `undefined`
     * @returns {T} item
     */
    static async getAsync(key, defaultValue) {
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

    /**
     * Asynchronously removes item stored in specified key
     * @param {string} key 
     */
    static async removeAsync(key) {
        return new Promise(
            (resolve, reject) => {
                chrome.storage.sync.remove('webRedirect', function () {
                    resolve();
                });
            }
        )
    }
}