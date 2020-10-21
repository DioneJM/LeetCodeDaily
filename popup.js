  let changeColor = document.getElementById('changeColor');

  changeColor.onclick = function(element) {
    let color = element.target.value;
    chrome.storage.sync.remove('webRedirect', function() {
        console.log('removed value for webRedirect');
        const updateProperties = {
            url: 'https://leetcode.com/problems/random-one-question/all',
            active: true,

        }
        const tabCallback = (tab) => {
            console.log('tab callback: ', tab);
        }
        chrome.tabs.update(null, updateProperties, tabCallback)
    });
  };