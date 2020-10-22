// set default settings if there aren't any existing
// black list YouTube by default because it has the feature built in
import { SITES_ALREADY_WITH_FEATURE } from '/helpers.js'

chrome.runtime.onInstalled.addListener(function(details){
    // pass in null to get all keys
    chrome.storage.sync.get(null, function (items) {
        chrome.storage.sync.set({
            'on': items['on'] ?? true,
            'autoFocus': items['autoFocus'] ?? false,
            'blackList': items['blackList'] ?? JSON.stringify(SITES_ALREADY_WITH_FEATURE)
        })
    })
})