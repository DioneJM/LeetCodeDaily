// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const leetCodeWildCards = [
    "*://*.leetcode.com/*",
    "*://leetcode.com/*"
];

const leetCodeProblemsWildCards = [
    "*://*.leetcode.com/problems/*",
    "*://leetcode.com/problems/*"
]

chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        console.log('page changed')
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { 
                    hostContains: 'leetcode.com',
                    pathContains: 'problems' 
                },
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
    chrome.windows.onCreated.addListener(
        function (window) {
            console.log('window created: ', window);
        }
    )
    chrome.tabs.onCreated.addListener(
        function (tab) {
            console.log('tab created: ', tab);
            const {
                pendingUrl
            } = tab;
            if (pendingUrl !== 'chrome://newtab/') {
                return;
            }

            const storageGetCallback = (result) => {
                console.log("saved: ", result);
                const cachedProblemUrl = result && result.webRedirect;

                const timestampCallback = (timestampResult) => {
                    const timestamp = timestampResult.timestamp;
                    console.log('timestamp from storage: ', timestampResult);
                    const currentMinute = Date.now().getMinutes();
                    // console.log('time diff: ', {
                    //     cached: timestampResult
                    // })
                }
                chrome.storage.sync.get('timestamp', timestampCallback);

                if (cachedProblemUrl) {
                    console.log('already cached, redirecting to cached: ', cachedProblemUrl);
                    const updateProperties = {
                        url: `${cachedProblemUrl}`,
                        active: true,

                    }
                    const tabCallback = (tab) => {
                        console.log('tab callback: ', tab);
                    }
                    chrome.tabs.update(null, updateProperties, tabCallback)
                    return;
                }
            }

            chrome.storage.sync.get('webRedirect', storageGetCallback);
        }
    )
    chrome.tabs.onUpdated.addListener(
        function (tabId, changeInfo, tab) {
            const hasLoaded = changeInfo.title && !changeInfo.title.toLowerCase().includes('loading') && !changeInfo.status && !changeInfo.url && !changeInfo.favIconUrl;
            if (!hasLoaded) {
                return;
            }

            const content = document.querySelector("[data-key=description-content]");
            console.log('tab updated: ', {
                changeInfo,
                tab,
                content,
                document
            });
        }
    )
    chrome.webRequest.onBeforeRedirect.addListener(
        function (details) {
            console.log('redirecting: ', details);
            console.log('from url: ', details.url);

            if (details.url === "https://leetcode.com/problems/random-one-question/all") {
                chrome.storage.sync.set({ webRedirect: details.redirectUrl }, function () {
                    console.log("redirect saved: ", details.redirectUrl);
                });
                const timestamp = Date.now().getMinutes();
                chrome.storage.sync.set({ timestamp }, function () {
                    console.log("timestamp saved: ", timestamp);
                });
            }

        },
        { urls: [...leetCodeWildCards] },
        ["responseHeaders"]
    )
    chrome.webRequest.onCompleted.addListener(
        function (details) {
            console.log('completed web request: ', details);
        },
        { urls: [...leetCodeProblemsWildCards] },
        ["responseHeaders"]
    )
});
