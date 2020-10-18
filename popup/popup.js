/*
    On/Off  button
*/

// Get the elements
const checkbox = document.querySelector('#onCheckbox')
const label = document.querySelector('#onLabel')
const updateLabelText = on => label.textContent = on ? 'On' : 'Off'

// Initialize button state
chrome.storage.sync.get('on', function (data) {
    const serviceOn = data.on ?? true
    checkbox.checked = serviceOn
    updateLabelText(serviceOn)
})

checkbox.addEventListener('change', ev => {
    const checked = ev.target.checked

    chrome.storage.sync.set({
        'on': checked
    })
    updateLabelText(checked)
})

/*
    Auto focus button
*/
const autoFocusCheckbox = document.querySelector('#autoFocusCheckbox')

// Initialize button state
chrome.storage.sync.get('autoFocus', function (data) {
    const autoFocusOn = data.autoFocus ?? false
    autoFocusCheckbox.checked = autoFocusOn
})

autoFocusCheckbox.addEventListener('change', ev => {
    const checked = ev.target.checked

    chrome.storage.sync.set({
        'autoFocus': checked
    })
})

/*
    White list website button
*/
// function to get black listed sites from storage
const getBlackList = () => new Promise(
    resolve => chrome.runtime.sendMessage({ type: 'getBlacklist' }, blackList => {
        resolve(blackList['blackList'])
    })
)
const websiteCheckbox = document.querySelector('#websiteCheckbox')
const websiteLabel = document.querySelector('#websiteLabel')

// get current URL first
chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, async tabs => {
        const currentTab = tabs[0]
        const currentURL = new URL(currentTab.url)
        const currentDomain = currentURL.hostname
        let blackList = await getBlackList()
        console.log(blackList)
        const currentSiteBlocked = blackList.includes(currentDomain)

        websiteLabel.textContent = 'Black list ' + currentDomain
        websiteCheckbox.checked = currentSiteBlocked


        websiteCheckbox.addEventListener('change', ev => {
            const checked = ev.target.checked
            if (checked) {
                blackList = [...blackList, currentDomain]
                // stop service if blacklisted
                chrome.tabs.sendMessage(currentTab.id, {type: 'stopService'})
            } else {
                const index = blackList.indexOf(currentDomain)
                if (index > -1) blackList.splice(index, 1)
                // start service if checked
                chrome.tabs.sendMessage(currentTab.id, {type: 'startService'})
            }
            chrome.storage.sync.set({
                'blackList': JSON.stringify(blackList)
            })

        })
})

