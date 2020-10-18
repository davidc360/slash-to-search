// Async get service on
const getServiceOn = () => new Promise(
    resolve => chrome.storage.sync.get('on', data => {
        resolve(data['on'])
    })
)
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


/*
    Get elements first
*/
// on/off button
const onCheckbox = document.querySelector('#onCheckbox')
const onLabel = document.querySelector('#onLabel')
const updateOnLabelText = on => onLabel.textContent = on ? 'On' : 'Off'

// black list button
const websiteCheckbox = document.querySelector('#websiteCheckbox')
const websiteLabel = document.querySelector('#websiteLabel')

// get current URL first
chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, async tabs => {
        const currentTab = tabs[0]
        const tabID = currentTab.id
        const currentURL = new URL(currentTab.url)
        const currentDomain = currentURL.hostname
        let blackList = await getBlackList()
        const currentSiteBlocked = blackList.includes(currentDomain)

        /* 
        Handle on/off button
        */
        let serviceOn = await getServiceOn()
        onCheckbox.checked = serviceOn
        updateOnLabelText(serviceOn)
        
        onCheckbox.addEventListener('change', ev => {
            const checked = ev.target.checked
            serviceOn = checked
        
            chrome.storage.sync.set({
                'on': checked
            })
            updateOnLabelText(checked)
        
            chrome.tabs.sendMessage(tabID, {
                type: (checked && !currentSiteBlocked)
                    ? 'startService' : 'stopService'
            })

        })

        /* 
        Handle black list
        */
        websiteLabel.textContent = 'Black list ' + currentDomain
        websiteCheckbox.checked = currentSiteBlocked


        websiteCheckbox.addEventListener('change', async ev => {
            const checked = ev.target.checked
            if (checked) {
                blackList = [...blackList, currentDomain]
                // stop service if blacklisted
                chrome.tabs.sendMessage(currentTab.id, {type: 'stopService'})
            } else {
                const index = blackList.indexOf(currentDomain)
                if (index > -1) blackList.splice(index, 1)
                // start service if checked (if service is on)
                if(serviceOn)
                    chrome.tabs.sendMessage(currentTab.id, {type: 'startService'})
            }
            chrome.storage.sync.set({
                'blackList': JSON.stringify(blackList)
            })
        })
})