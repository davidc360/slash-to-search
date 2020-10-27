// websites with feature disabled by default
// because they already have the feature
export const SITES_ALREADY_WITH_FEATURE = [
    'www.youtube.com',
    'github.com'
]

export const asyncSendMessage = async (message) => (
    new Promise(resolve => {
        chrome.runtime.sendMessage(message, resp => resolve(resp))
    })
)

export const asyncSetChromeSyncStorage = async(obj) => (
    new Promise(resolve => {
        chrome.storage.sync.set(obj, resp => resolve(resp))
    })
)

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

// get current URL asynchronously
export const asyncGetCurrentDomain = () => new Promise(resolve => (
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, tabs => {
        resolve(new URL(tabs[0].url).hostname)       
    })
 ))

export const shouldDoOnSite = async ({ serviceName, blacklistName, whitelistName, domain }) => {
    const serviceOn = await asyncReadFromStorage(serviceName)
    let blacklist = JSON.parse(await asyncReadFromStorage(blacklistName) ?? JSON.stringify([]))
    let whitelist = JSON.parse(await asyncReadFromStorage(whitelistName) ?? JSON.stringify([]))

    return serviceOn ?
        !blacklist.includes(domain)
        : whitelist.includes(domain)
}

export const shouldRunServiceOnSite = async() => {
    const domain = await asyncGetCurrentDomain()
    return shouldDoOnSite({
        serviceName: 'allSiteOn',
        blacklistName: 'serviceBlacklist',
        whitelistName: 'serviceWhitelist',
        domain: domain
    })
}

export const shouldAutoFocusOnSite = async() => {
    const domain = await asyncGetCurrentDomain()
    return shouldDoOnSite({
        serviceName: 'autoFocus',
        blacklistName: 'autofocusBlacklist',
        whitelistName: 'autofocusWhitelist',
        domain: domain
    })
}