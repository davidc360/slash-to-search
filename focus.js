// Listener for when background script
// sends command to focus (i.e., when focus on page load)
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == "focusOnSearch") {
            focusOnSearch()
      }
})

// Get input elements with type 'text' or 'search'
function getInputElements() {
    return Array.from(
        document.querySelectorAll('input[type="search"], input[type="text"]')
    )
}

// Determine if the element is labeled as 'search'
function isLabeledSearch(el) {
    return el.outerHTML && (
        el.outerHTML.includes('Search')
        || el.outerHTML.includes('search')
    )
}

// Determine if an element is currently not visible
function isHidden(el) {
    const searchPhrases = [
        'hidden',
        'disabled',
        'display:none',
        'display: none',
    ]

    return searchPhrases.some(phrase => el.outerHTML.includes(phrase))
}

// Determine if an element is used for typing
function isTypingArea(el) {
    if (el.type === 'text'
        || el.type === 'textarea'
        || el.contentEditable === 'true'
        || el.contentEditable === 'True'
    ) return true

    return false
}

// Focus on an element and print it out in console
function focus(el) {
    el.focus()
    console.log('focused on: ', el)
}

function focusOnSearch() {
    const inputEls = getInputElements()

    for (const el of inputEls) {
        if (isLabeledSearch(el)) {
            focus(el)
            return
        }
    }

    for (const el of inputEls) {
        if (!isHidden(el)) {
            focus(el)
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

document.addEventListener('keypress', handleKeyPress)

