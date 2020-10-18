// set default settings if there aren't any existing
// black list YouTube by default because it has the feature built in
const DEFAULT_BLACK_LISTED = ['www.youtube.come']
chrome.runtime.onInstalled.addListener(function(details){
    // pass in null to get all keys
    chrome.storage.sync.get(null, function (items) {
        chrome.storage.sync.set({
            'on': items['on'] ?? true,
            'autoFocus': items['autoFocus'] ?? false,
            'blackList': items['blackList'] ?? JSON.stringify(DEFAULT_BLACK_LISTED)
        })
    })
})