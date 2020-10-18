/*
    Helpers
*/
const asyncReadFromStorage = (key, local = false) => (
    new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, function(result) {
            resolve(result[key])
        })
    })
)

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        const senderId = sender.tab && sender.tab.id
        switch (request.type) {
            case 'runContentScript':
                (async () => {
                    // abort is service is toggled off
                    const serviceOn = await asyncReadFromStorage('on')
                    if (!serviceOn) return
                    
                    // abort if current site is listed
                    const currentDomain = new URL(sender.tab.url).hostname
                    const blackList = JSON.parse(await asyncReadFromStorage('blackList'))
                    if (blackList.includes(currentDomain)) return
                    
                    // inject script if not blacklist or off
                    chrome.tabs.executeScript(senderId, {
                        file: 'focus.js'
                    })
        
                    const autoFocus = await asyncReadFromStorage('autoFocus')
                    if (autoFocus) {
                        chrome.tabs.sendMessage(senderId, {
                            type: 'focusOnSearch'
                        })
                    }
                })()
                break
            
            case 'getBlacklist':
                (async () => {
                    const blackList = JSON.parse(await asyncReadFromStorage('blackList'))
                    sendResponse({
                        blackList: blackList
                    })
                })()
                // return true because sendResponse is called
                // asynchronously, see https://developer.chrome.com/extensions/messaging
                return true
        }
    }
)