/*
    On/Off  button
*/

// Get the elements
const checkbox = document.querySelector('#onCheckbox')
const label = document.querySelector('#onLabel')
const updateLabelText = on => label.textContent = on ? 'On' : 'Off'

// Initialize button state
chrome.storage.sync.get('on', function (data) {
    const serviceOn = data.on ?? true
    checkbox.checked = serviceOn
    updateLabelText(serviceOn)
})

checkbox.addEventListener('change', ev => {
    const checked = ev.target.checked

    chrome.storage.sync.set({
        'on': checked
    })
    updateLabelText(checked)
})

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