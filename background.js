/*
    Helpers
*/
function asyncReadFromStorage(key, local = false) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, function(result) {
            resolve(result[key])
        })
    })
}

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        const senderId = sender.tab.id
        if (request.type === 'runContentScript') {
            const serviceOn = await asyncReadFromStorage('on')
                
            if (serviceOn) {
                chrome.tabs.executeScript(senderId, {
                    file: 'focus.js'
                })
            }

            const autoFocus = await asyncReadFromStorage('autoFocus')
            if (autoFocus) {
                chrome.tabs.sendMessage(senderId, {
                    type: 'focusOnSearch'
                })
            }
        }
      }
)