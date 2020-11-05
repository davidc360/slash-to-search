(async () => {
    const helpersSrc = chrome.extension.getURL('/helpers.js')
    const {
        shouldClearSearchOnSite
    } = await import(helpersSrc)
    chrome.runtime.sendMessage({
        type: 'runContentScript',
        domain: window.location.hostname
    })

    // Listener for when background script
    // sends command to focus (i.e., when focus on page load)
    chrome.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {
            switch (request.type) {
                case 'focusOnSearch':
                    focusOnSearch()
                    break
                    
                // Listen for starting service
                case 'startService':
                    startListener()
                    break
                
                // Listen for stopping service
                case 'stopService':
                    stopListener()
                    break
            }
    })

    // Get input elements with type 'text' or 'search'
    const getInputElements = () => Array.from(
        document.querySelectorAll('input')
    )

    // Determine if the element is labeled as 'search'
    const isLabeledSearch = el => (
        el.outerHTML && (
        el.outerHTML.includes('Search')
        || el.outerHTML.includes('search')
        )
    )

    // Determine if an element is visible and editable
    const isEditable = el => {
        const PHRASES_INDICATING_HIDDEN_EL = [
            'hidden',
            'disabled',
            'display:none',
            'display: none',
        ]

        if (PHRASES_INDICATING_HIDDEN_EL.some(phrase => el.outerHTML.includes(phrase)))
        return false

        // check if readonly
        if (el.readOnly === true) return false
        if (el.readonly === true) return false

        // offsetParent will return null if hidden or position fixed
        if (el.offsetParent === null) return false

        // check if height or width is 0
        if (el.offsetHeight === 0 || el.offsetWidth === 0) return false


        // if not found to be not editable
        return true
    }

    // Determine if input element is for text
    const isText = el => {
        const types = [
            'text',
            'search',
            'email',
            'number',
            'phone',
            'url',
        ]
        return types.includes(el.type)
    }

    // Determine if an element is used for typing
    const isTypingArea = el => (
        el.type === 'text'
        || el.type === 'textarea'
        || el.contentEditable === true
        || el.contentEditable === 'true'
        || el.contentEditable === 'True'
    )

    // Focus on an element and print it out in console
    const focus = async(el, reason) => {
        el.focus()
        console.log('focused on: ', el)
        
        if (reason)
            console.log('reason: ' + reason)
        
        el.setSelectionRange(el.value.length, el.value.length)
        const shouldClear = await shouldClearSearchOnSite(window.location.hostname)
        if (shouldClear) el.value = ''
    }

    const focusOnSearch = () => {
        const inputEls = getInputElements()

        for (const el of inputEls) {
            if (isLabeledSearch(el) && isEditable(el)) {
                focus(el, 'element labeled search')
                return
            }
        }

        for (const el of inputEls) {
            if (isText(el) && isEditable(el)) {
                focus(el, 'first input on page')
                return
            }
        }

        // If not focused on any elements
        console.log('no search bar found')
    }

    function handleKeyPress(ev) {
        // Stop if key was pressed when focused on a typing area
        // (Meaning user is typing)
        if (isTypingArea(ev.target)) return

        if (ev.key === '/') {
            /* setTimeout 0 is needed to send the call
            to the bottom of the stack,
            so that the default event happens before focusOnSearch()
            */
            setTimeout(focusOnSearch, 0)
        }
    }

    const startListener = () => {
        stopListener()
        document.addEventListener('keypress', handleKeyPress)
    }
    const stopListener = () => document.removeEventListener('keypress', handleKeyPress)
})()