function getAllInputElements() {
    return document.querySelectorAll('input')
}

function isLabeledSearch(element) {
    return element.outerHTML && element.outerHTML.includes('search')
}

function focusOnSearch() {
    for (const element of getAllInputElements()) {
        if (isLabeledSearch(element)) {
            element.focus()
            console.log('focused on search bar')
            break
        }
    }
}

function handleKeyPress(e) {
    if (e.key === '/') {
        e.preventDefault()
        focusOnSearch()
    }
}

document.addEventListener('keypress', handleKeyPress)

