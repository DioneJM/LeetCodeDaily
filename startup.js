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
                }

                if (!cachedProblemUrl) {
                    console.log('no cache found, getting new problem');
                    const updateProperties = {
                        url: 'https://leetcode.com/problems/random-one-question/all',
                        active: true,
                    }
                    const tabCallback = (tab) => {
                        console.log('tab callback: ', tab);
                    }
                    chrome.tabs.update(null, updateProperties, tabCallback)
                    return;
                }

                console.log('already cached, redirecting to cached: ', cachedProblemUrl);
                const updateProperties = {
                    url: `${cachedProblemUrl}`,
                    active: true,

                }
                const tabCallback = (tab) => {
                    console.log('tab callback: ', tab);
                }
                chrome.tabs.update(null, updateProperties, tabCallback)


            }

            chrome.storage.sync.get('webRedirect', storageGetCallback);
        }
    )
    chrome.tabs.onUpdated.addListener(
        function (tabId, changeInfo, tab) {
            const hasLoaded = changeInfo.title && !changeInfo.title.toLowerCase().includes('loading') && !changeInfo.status && !changeInfo.url && !changeInfo.favIconUrl;

            chrome.storage.sync.get('lastLoadTimestamp', function ({ lastLoadTimestamp }) {

                const currentTimestamp = new Date(Math.floor(lastLoadTimestamp) || 0);

                chrome.storage.sync.get('problemCacheTimestamp', function ({ problemCacheTimestamp }) {
                    const problemTimestamp = new Date(Math.floor(problemCacheTimestamp) || 0);
                    console.log("timestamps: ", {
                        currentTimestamp: currentTimestamp.getDay(),
                        problemTimestamp: problemTimestamp.getDay()
                    });

                    const dateIsDifferent = currentTimestamp.getDate() !== currentTimestamp.getDate();
                    const isNewDay = currentTimestamp.getDay() > problemTimestamp.getDay() || (currentTimestamp.getDay() == 0 && problemTimestamp.getDay() == 6);

                    if (isNewDay || dateIsDifferent) {
                        console.log('enough time has passed')
                        chrome.storage.sync.remove('webRedirect', function () {
                            console.log('removed value for webRedirect');
                            const updateProperties = {
                                url: 'https://leetcode.com/problems/random-one-question/all',
                                active: true,
    
                            }
                            const tabCallback = (tab) => {
                                console.log('tab callback: ', tab);
                                chrome.storage.sync.set({ problemCacheTimestamp: lastLoadTimestamp }, function () {
                                    console.log("enoughTimeHasPassed - setting problemCacheTimestamp: ", lastLoadTimestamp);
                                });
                            }
                            chrome.tabs.update(null, updateProperties, tabCallback)
                        });
                    } else {
                        console.log('not enough time has passed, showing cached problem');
                    }
                });
            });


            if (!hasLoaded) {
                return;
            }

        }
    )
    chrome.webRequest.onBeforeRedirect.addListener(
        function (details) {
            console.log('redirecting: ', details);
            console.log('from url: ', details.url);
            if (details.url === "https://leetcode.com/problems/random-one-question/all") {
                chrome.storage.sync.set({ webRedirect: details.redirectUrl }, function () {
                    console.log("redirect saved: ", details.redirectUrl);
                    chrome.storage.sync.set({ problemCacheTimestamp: details.timeStamp }, function () {
                        console.log("webRequest.onBEforeRedirect - setting problemCacheTimestamp: ", details.timeStamp);
                    });
                });

            }
        },
        {
            urls: [...leetCodeWildCards]
        },
        ["responseHeaders"]
    )
    chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            console.log('on before web request: ', details);
            chrome.storage.sync.set({ lastLoadTimestamp: details.timeStamp }, function () {
                console.log("setting lastLoadTimestamp: ", details.timeStamp);
            });
        },
        { urls: [...leetCodeProblemsWildCards] }
    )
});
