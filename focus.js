// Listener for when background script
// sends command to focus (i.e., when focus on page load)
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.type == "focusOnSearch") {
            focusOnSearch()
        }
})
// Listen for stopping service
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.type == "stopListener") {
            stopListener()
        }
})

// Get input elements with type 'text' or 'search'
const getInputElements = () => Array.from(
    document.querySelectorAll('input[type="search"], input[type="text"]')
)

// Determine if the element is labeled as 'search'
const isLabeledSearch = el => (
    el.outerHTML && (
    el.outerHTML.includes('Search')
    || el.outerHTML.includes('search')
    )
)

// Determine if an element is currently not visible
const PHRASES_INDICATING_HIDDEN_EL = [
    'hidden',
    'disabled',
    'display:none',
    'display: none',
]
const isHidden = el => {
    if (PHRASES_INDICATING_HIDDEN_EL.some(phrase => el.outerHTML.includes(phrase)))
        return true
    // offsetParent will return null if hidden or position fixed
    if (el.offsetParent === null) return true

    //check if height or width is 0
    if (el.offsetHeight === 0 || el.offsetWidth === 0) return true

    // if not found to be hidden
    return false
}

// Determine if an element is used for typing
const isTypingArea = el => (
    el.type === 'text'
    || el.type === 'textarea'
    || el.contentEditable === 'true'
    || el.contentEditable === 'True'
)

// Focus on an element and print it out in console
const focus = (el, reason) => {
    el.focus()
    console.log('focused on: ', el)
    if (reason) console.log('reason: ' + reason)
}

const focusOnSearch = () => {
    const inputEls = getInputElements()

    for (const el of inputEls) {
        if (isLabeledSearch(el)) {
            focus(el, 'element labeled search')
            return
        }
    }

    for (const el of inputEls) {
        if (!isHidden(el)) {
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

const slashListener = document.addEventListener('keypress', handleKeyPress)

const stopListener = () => document.removeEventListener(slashListener)


