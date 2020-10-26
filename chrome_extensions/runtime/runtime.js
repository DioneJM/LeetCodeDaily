
import DeclarativeContent from '../declarativeContent/declarativeContent';
import Tabs from '../tabs/tabs';
import WebRequest from '../webRequest/webRequest';

export default class ChromeRuntime {

    static registerOnInstalledListener() {
        chrome.runtime.onInstalled.addListener(function () {
            DeclarativeContent.registerOnPageChangedListener();
            Tabs.registerOnCreatedListener();
            Tabs.registerOnUpdatedListener();
            WebRequest.registerOnBeforeRedirectListener();
            WebRequest.registerOnBeforeRequestListener();
        });
    }
}