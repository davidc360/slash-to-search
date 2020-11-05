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
        shouldAutoFocusOnSite,
        shouldClearSearchOnSite
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
    const select = selector => document.querySelector(selector)
    // on/off button
    const onCheckbox = select('#onCheckbox')
    const currentSiteOnCheckbox = select('#currentSiteOnCheckbox')
    
    // auto focus button
    const autoFocusCheckbox = select('#autoFocusCheckbox')
    const currentSiteAutoFocusCheckBox = select('#currentSiteAutoFocusCheckbox')

    // clear search button
    const clearCheckbox = select('#clearCheckbox')
    const currentSiteClearCheckBox = select('#currentSiteClearCheckbox')

    // note element
    const noteEl = select('#note')
    const noteURLEl = noteEl.children[0]
    
    /* 
        initialize states
    */
    const currentTab = await asyncGetCurrentTab()
    const tabID = currentTab.id
    const currentDomain = new URL(currentTab.url).hostname

    /* 
        Handle on/off button
    */
    const allSiteOn = await asyncReadFromStorage('allSiteOn')
    setColor(onCheckbox, allSiteOn ? 'green' : 'red')
    
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
    const currentSiteOn = await shouldRunServiceOnSite()
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
    const autoFocusOn = await asyncReadFromStorage('autoFocus')
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
    const currentSiteAutoFocusOn = await shouldAutoFocusOnSite()
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

    /*
        Handle clear search on focus
    */
    const clearSearch = await asyncReadFromStorage('clearSearch')
    setColor(clearCheckbox, clearSearch ? 'green' : 'red')
    
    clearCheckbox.addEventListener('click', async(ev) => {
        let allSiteOn = containsClassGreen(ev.target) ? true : false
        allSiteOn = !allSiteOn
        await asyncSetChromeSyncStorage({
            'clearSearch': allSiteOn
        })
        
        const shouldRunService = await shouldClearSearchOnSite()
        setColor(clearCheckbox, allSiteOn ? 'green' : 'red')
        setColor(currentSiteClearCheckBox, shouldRunService ? 'green' : 'red')
    })
    
    /*
    Handle clear search on current site
    */
    const currentSiteClearSearchOn = await shouldClearSearchOnSite()
    setColor(currentSiteClearCheckBox, currentSiteClearSearchOn ? 'green' : 'red')

    currentSiteClearCheckBox.addEventListener('click', async ev => {
        let allSiteOn = await asyncReadFromStorage('clearSearch')
        let currentSiteOn = containsClassGreen(ev.target) ? true : false
        let serviceBlacklist = JSON.parse(await asyncReadFromStorage('clearSearchBlacklist') ?? JSON.stringify([]))
        let serviceWhitelist = JSON.parse(await asyncReadFromStorage('clearSearchWhitelist') ?? JSON.stringify([]))

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
                clearSearchBlacklist: JSON.stringify(serviceBlacklist)
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
                clearSearchWhitelist: JSON.stringify(serviceWhitelist)
            })
        }
    })
})()