
import { 
    leetCodeWildCards,
    leetCodeProblemsWildCards,
    leetCodeRandomQuestionUrl,
} from '../../config/leetcode';
import StorageSync from '../storage/storage';

export default class WebRequest {

    static registerOnBeforeRedirectListener() {
        chrome.webRequest.onBeforeRedirect.addListener(
            function (details) {
                if (details.url === leetCodeRandomQuestionUrl) {
                    StorageSync.set({ webRedirect: details.redirectUrl });
                    StorageSync.set({ problemCacheTimestamp: details.timeStamp });
                }
            },
            {
                urls: [...leetCodeWildCards]
            },
            ["responseHeaders"]
        )
    }

    static registerOnBeforeRequestListener() {
        chrome.webRequest.onBeforeRequest.addListener(
            async function (details) {
                StorageSync.set({ lastLoadTimestamp: details.timeStamp });
            },
            { urls: [...leetCodeProblemsWildCards] }
        )
    }
}
