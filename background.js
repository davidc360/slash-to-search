chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if( request.type === 'runContentScript' ) {
            chrome.storage.local.get('on', function (data) {
                if (!data.on) return
                
                chrome.tabs.executeScript(sender.tab.id, {
                    file: 'focus.js'
                })
            })
        }
      }
)