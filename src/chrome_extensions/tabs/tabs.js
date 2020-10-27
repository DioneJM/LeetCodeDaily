import StorageSync from '../storage/storage';
import { leetCodeRandomQuestionUrl } from '../../../config/leetcode';
import { chromeNewTabUrl } from '../../../config/chrome';


export default class Tabs {

    static async registerOnCreatedListener() {
        chrome.tabs.onCreated.addListener(
            async function (tab) {
                const { pendingUrl } = tab;

                if (pendingUrl !== chromeNewTabUrl) {
                    return;
                }

                const cachedProblemUrl = await StorageSync.getAsync('webRedirect');

                if (!cachedProblemUrl) {
                    Tabs.redirectToUrl(leetCodeRandomQuestionUrl);
                    return;
                }

                Tabs.redirectToUrl(cachedProblemUrl)

            }
        )
    }

    /**
     * 
     * @param {string} url - url to redirect to
     * @param {{(tab?) => void}=} onRedirect - callback to be called once redirected. Is passed the `tab` object documented in chrome.tabs
     * @param {boolean=} setTabActive - flag to set `updateProperties.active`
     * @returns void
     */
    static redirectToUrl(url, onRedirect, setTabActive) {
        const updateProperties = {
            url,
            active: setTabActive == undefined ? true : setTabActive,
        }
        const tabCallback = (tab) => {
            if (onRedirect == undefined) {
                return;
            }
            if (typeof onRedirect !== 'function') {
                throw new Error('onRedirect callback must be a function if defined, it is a: ', typeof onRedirect);
            }
            if (typeof onRedirect === 'function') {
                onRedirect(tab);
            }
        }
        chrome.tabs.update(null, updateProperties, tabCallback)
    }

    static registerOnUpdatedListener() {
        chrome.tabs.onUpdated.addListener(
            async function (tabId, changeInfo, tab) {
                const hasLoaded = changeInfo.title && !changeInfo.title.toLowerCase().includes('loading') && !changeInfo.status && !changeInfo.url && !changeInfo.favIconUrl;

                if (!hasLoaded) {
                    return;
                }

                const lastLoadTimestamp = await StorageSync.getAsync('lastLoadTimestamp');
                const currentTimestamp = new Date(Math.floor(lastLoadTimestamp) || 0);
                const problemCacheTimestamp = await StorageSync.getAsync('problemCacheTimestamp');
                const problemTimestamp = new Date(Math.floor(problemCacheTimestamp) || 0);

                const dateIsDifferent = currentTimestamp.getDate() !== currentTimestamp.getDate();
                const isNewDay = currentTimestamp.getDay() > problemTimestamp.getDay() || (currentTimestamp.getDay() == 0 && problemTimestamp.getDay() == 6);

                if (isNewDay || dateIsDifferent) {
                    await StorageSync.removeAsync('webRedirect');
                    const redirectCallback = async (tab) => {
                        await StorageSync.set({ problemCacheTimestamp: lastLoadTimestamp });
                    }
                    Tabs.redirectToUrl(leetCodeRandomQuestionUrl, redirectCallback);
                }
            }
        )
    }
}