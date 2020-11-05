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
                    const shouldRun = await shouldRunServiceOnSite(senderURL)
                    if (!shouldRun) return
                    
                    // start service if not blacklisted or off
                    chrome.tabs.sendMessage(senderId, {
                        type: 'startService'
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