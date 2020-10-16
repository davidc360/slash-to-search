// set default settings if there aren't any existing
chrome.runtime.onInstalled.addListener(function(details){
    // pass in null to get all keys
    chrome.storage.sync.get(null, function (items) {
        chrome.storage.sync.set({
            'on': items['on'] ?? true,
            'autoFocus': items['autoFocus'] ?? false
        })
    })
})