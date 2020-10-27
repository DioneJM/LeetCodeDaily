import { pageUrlMatcher } from "./config";

export default class DeclarativeContent {

    static registerOnPageChangedListener() {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: pageUrlMatcher,
                })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }]);
        });
    }

}