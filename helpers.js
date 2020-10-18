// websites with feature disabled by default
// because they already have the feature
export const SITE_ALREADY_WITH_FEATURE = [
    'www.youtube.com',
    'github.com'
]

// read from storage asynchronously
export const asyncReadFromStorage = (key, local = false) => (
    new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, function(result) {
            resolve(result[key])
        })
    })
)

// get current tab asynchronously
export const asyncGetCurrentTab = () => new Promise(resolve => (
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, tabs => (
        resolve(tabs[0])
    ))
 ))

// function to get black listed sites from storage
export const asyncGetBlackList = () => new Promise(
    resolve => chrome.runtime.sendMessage({ type: 'getBlacklist' }, blackList => {
        resolve(blackList['blackList'])
    })
)