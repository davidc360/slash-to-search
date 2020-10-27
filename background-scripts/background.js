/*
    Helpers
*/
import {
    asyncReadFromStorage,
    shouldRunServiceOnSite,
    shouldAutoFocusOnSite,
} from '/helpers.js'

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        const senderId = sender.tab && sender.tab.id
        const senderURL = new URL(sender.tab.url).hostname
        switch (request.type) {
            case 'runContentScript':
                (async () => {
                    // determine if service should run
                    // if not then abort
                    const serviceOn = await shouldRunServiceOnSite(senderURL)
                    if (!serviceOn) return
                    
                    // inject script if not blacklist or off
                    chrome.tabs.executeScript(senderId, {
                        file: 'content-scripts/focus.js'
                    })
        
                    // determine if should autoFocus
                    const autoFocus = await shouldAutoFocusOnSite()
                    if (autoFocus) {
                        chrome.tabs.sendMessage(senderId, {
                            type: 'focusOnSearch'
                        })
                    }
                })()
                break
        }
    }
)