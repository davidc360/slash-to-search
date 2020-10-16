chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == "focusOnSearch") {
            focusOnSearch()
      }
})

function getFilteredInputElements() {
    const ALLOWED_TYPES = ['text', 'search']
    return Array.from(document.querySelectorAll('input')).filter(el => ALLOWED_TYPES.includes(el.type))
}

function isLabeledSearch(el) {
    return el.outerHTML && el.outerHTML.includes('search')
}

function isHidden(el) {
    let isHidden = false
    const searchPhrases = [
        'hidden',
        'disabled',
        'display:none',
        'display: none',
    ]
    if (searchPhrases.some(phrase => el.outerHTML.includes(phrase)))
        isHidden = true

    return isHidden
}

function focus(el) {
    el.focus()
    console.log('focused on: ', el)
}

function focusOnSearch() {
    const inputEls = getFilteredInputElements()

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

    console.log('no search bar found')
}

function handleKeyPress(ev) {
    // Stop if key was pressed when focused on a text field
    // (Meaning user is typing)
    if (ev.target.type === 'text') return
    if (ev.key === '/') {
        ev.preventDefault()
        focusOnSearch()
    }
}

document.addEventListener('keypress', handleKeyPress)

