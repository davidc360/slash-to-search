chrome.runtime.sendMessage({
    type: 'runContentScript',
    domain: window.location.hostname
})