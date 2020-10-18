// read from storage asynchronously
const asyncReadFromStorage = (key, local = false) => (
    new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, function(result) {
            resolve(result[key])
        })
    })
)