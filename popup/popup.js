(async () => {
    /*
        import helpers
    */
    const helpersSrc = chrome.extension.getURL('/helpers.js')
    const { 
        asyncSetChromeSyncStorage,
        asyncReadFromStorage,
        asyncGetCurrentTab,
        SITES_ALREADY_WITH_FEATURE,
        shouldRunServiceOnSite,
        shouldAutoFocusOnSite
     } = await import(helpersSrc)

    const setColor = (el, color) => {
        if (color === 'green') {
            el.classList.remove('red')
            el.classList.add('green')
        } else if (color === 'red'){
            el.classList.remove('green')
            el.classList.add('red') 
        } else {
            throw new Error('Invalid color in setColor')
        }
    }
    
    const containsClassGreen = el => el.classList.contains('green')
    /*
        Grab elements
    */
    // on/off button
    const onCheckbox = document.querySelector('#onCheckbox')
    const currentSiteOnCheckbox = document.querySelector('#currentSiteOnCheckbox')
    
    // auto focus button
    const autoFocusCheckbox = document.querySelector('#autoFocusCheckbox')
    const currentSiteAutoFocusCheckBox = document.querySelector('#currentSiteAutoFocusCheckbox')

    // note element
    const noteEl = document.querySelector('#note')
    const noteURLEl = noteEl.children[0]
    
    /* 
    initialize states
    */
    const currentTab = await asyncGetCurrentTab()
    const tabID = currentTab.id
    const currentDomain = new URL(currentTab.url).hostname

    // For controlling the service status
    const allSiteOn = await asyncReadFromStorage('allSiteOn')
    const currentSiteOn = await shouldRunServiceOnSite()

    // For controlling auto focus
    const autoFocusOn = await asyncReadFromStorage('autoFocus')
    const currentSiteAutoFocusOn = await shouldAutoFocusOnSite()
    /* 
        Handle on/off button
    */
    setColor(onCheckbox, allSiteOn ? 'green' : 'red')
    setColor(currentSiteOnCheckbox, currentSiteOn ? 'green' : 'red')
    
    onCheckbox.addEventListener('click', async(ev) => {
        let allSiteOn = containsClassGreen(ev.target) ? true : false
        allSiteOn = !allSiteOn
        await asyncSetChromeSyncStorage({
            'allSiteOn': allSiteOn
        })

        const shouldRunService = await shouldRunServiceOnSite()
        setColor(onCheckbox, allSiteOn ? 'green' : 'red')
        setColor(currentSiteOnCheckbox, shouldRunService ? 'green' : 'red')

        chrome.tabs.sendMessage(tabID, {
            type: shouldRunService ?
                'startService' : 'stopService'
        })
    })

    /* 
        Handle current site on
    */
   
    setColor(currentSiteOnCheckbox, currentSiteOn ? 'green' : 'red')

    // if site already has feature built in, let users know
    if (SITES_ALREADY_WITH_FEATURE.includes(currentDomain)) {
        noteEl.classList.remove('hidden')
        noteURLEl.innerText = currentDomain 
    }

    currentSiteOnCheckbox.addEventListener('click', async ev => {
        let allSiteOn = await asyncReadFromStorage('allSiteOn')
        let currentSiteOn = containsClassGreen(ev.target) ? true : false
        let serviceBlacklist = JSON.parse(await asyncReadFromStorage('serviceBlacklist') ?? JSON.stringify([]))
        let serviceWhitelist = JSON.parse(await asyncReadFromStorage('serviceWhitelist') ?? JSON.stringify([]))

        currentSiteOn = !currentSiteOn
        setColor(ev.target, currentSiteOn ? 'green' : 'red')

        if (allSiteOn) {
            const index = serviceBlacklist.indexOf(currentDomain)
            if (index > -1) {
                serviceBlacklist.splice(index, 1)
            } else {
                serviceBlacklist.push(currentDomain)
            }
            await asyncSetChromeSyncStorage({
                'serviceBlacklist': JSON.stringify(serviceBlacklist)
            })
        } else {
            // in blacklist, remove it
            const index = serviceWhitelist.indexOf(currentDomain)
            if (index > -1) {
                serviceWhitelist.splice(index, 1)
            } else {
                serviceWhitelist.push(currentDomain)
            }
            await asyncSetChromeSyncStorage({
                'serviceWhitelist': JSON.stringify(serviceWhitelist)
            })
        }
    
        chrome.tabs.sendMessage(tabID, {
            type: await shouldRunServiceOnSite() ?
                'startService' : 'stopService'
        })
    })

    /*
        Handle Auto focus    
    */
    setColor(autoFocusCheckbox, autoFocusOn ? 'green' : 'red')

    autoFocusCheckbox.addEventListener('click', async(ev) => {
        let allSiteOn = containsClassGreen(ev.target) ? true : false
        allSiteOn = !allSiteOn
        await asyncSetChromeSyncStorage({
            'autoFocus': allSiteOn
        })

        const shouldRunService = await shouldAutoFocusOnSite()
        setColor(autoFocusCheckbox, allSiteOn ? 'green' : 'red')
        setColor(currentSiteAutoFocusCheckBox, shouldRunService ? 'green' : 'red')
    })

    /*
        Handle Auto focus for current site
    */
    setColor(currentSiteAutoFocusCheckBox, currentSiteAutoFocusOn ? 'green' : 'red')

    currentSiteAutoFocusCheckBox.addEventListener('click', async ev => {
        let allSiteOn = await asyncReadFromStorage('autoFocus')
        let currentSiteOn = containsClassGreen(ev.target) ? true : false
        let serviceBlacklist = JSON.parse(await asyncReadFromStorage('autoFocusBlacklist') ?? JSON.stringify([]))
        let serviceWhitelist = JSON.parse(await asyncReadFromStorage('autoFocusWhitelist') ?? JSON.stringify([]))

        currentSiteOn = !currentSiteOn
        setColor(ev.target, currentSiteOn ? 'green' : 'red')

        if (allSiteOn) {
            const index = serviceBlacklist.indexOf(currentDomain)
            if (index > -1) {
                serviceBlacklist.splice(index, 1)
            } else {
                serviceBlacklist.push(currentDomain)
            }
            await asyncSetChromeSyncStorage({
                autoFocusBlacklist: JSON.stringify(serviceBlacklist)
            })
        } else {
            // in blacklist, remove it
            const index = serviceWhitelist.indexOf(currentDomain)
            if (index > -1) {
                serviceWhitelist.splice(index, 1)
            } else {
                serviceWhitelist.push(currentDomain)
            }
            await asyncSetChromeSyncStorage({
                autoFocusWhitelist: JSON.stringify(serviceWhitelist)
            })
        }
    })
})()