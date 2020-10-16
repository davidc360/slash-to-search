
// Get the elements
const checkbox = document.querySelector('#onCheckbox')
const label = document.querySelector('#onLabel')
const updateLabelText = on => label.textContent = on ? 'On' : 'Off'

// Initialize button state
chrome.storage.local.get('on', function (data) {
    const serviceOn = data.on ?? true
    checkbox.checked = serviceOn
    updateLabelText(serviceOn)
})

checkbox.addEventListener('change', ev => {
    const checked = ev.target.checked

    chrome.storage.local.set({
        'on': checked
    }, function (){
        console.log('setting stored')
    })
    updateLabelText(checked)
})