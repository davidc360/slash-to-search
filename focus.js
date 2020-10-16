function getTextInputElements() {
    return Array.from(document.querySelectorAll('input')).filter(el => el.type === 'text')
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

function focusOnSearch() {
    const inputEls = getTextInputElements()

    for (const el of inputEls) {
        if (isLabeledSearch(el)) {
            el.focus()
            return
        }
    }

    for (const el of inputEls) {
        if (!isHidden(el)) {
            el.focus()
            return
        }
    }

    console.log('no search bar found')
}

function handleKeyPress(e) {
    if (e.key === '/') {
        e.preventDefault()
        focusOnSearch()
    }
}

document.addEventListener('keypress', handleKeyPress)

