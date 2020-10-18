(async () => {
    /*
        import helpers
    */
    const helpersSrc = chrome.extension.getURL('/helpers.js')
    const { 
        asyncReadFromStorage,
        asyncGetCurrentTab,
        asyncGetBlackList
     } = await import(helpersSrc)

     const getServiceOn = () => asyncReadFromStorage('on')

    
    /*
        Get elements first
    */
    // on/off button
    const onCheckbox = document.querySelector('#onCheckbox')
    const onLabel = document.querySelector('#onLabel')
    const updateOnLabelText = on => onLabel.textContent = on ? 'On' : 'Off'

    // auto focus button
    const autoFocusCheckbox = document.querySelector('#autoFocusCheckbox')

    // black list button
    const websiteCheckbox = document.querySelector('#websiteCheckbox')
    const websiteLabel = document.querySelector('#websiteLabel')


    /* 
        initialize states
    */
    const currentTab = await asyncGetCurrentTab()
    const tabID = currentTab.id
    const currentURL = new URL(currentTab.url)
    const currentDomain = currentURL.hostname
    let blackList = await asyncGetBlackList()
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
        Handle Auto focus    
    */
    const autoFocusOn = await asyncReadFromStorage('autoFocus')
    autoFocusCheckbox.checked = autoFocusOn

    autoFocusCheckbox.addEventListener('change', ev => {
        const checked = ev.target.checked

        chrome.storage.sync.set({
            'autoFocus': checked
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
})()

// Initialize button state
// chrome.storage.sync.get('autoFocus', function (data) {
//     const autoFocusOn = data.autoFocus ?? false
//     autoFocusCheckbox.checked = autoFocusOn
// })

// autoFocusCheckbox.addEventListener('change', ev => {
//     const checked = ev.target.checked

//     chrome.storage.sync.set({
//         'autoFocus': checked
//     })
// })