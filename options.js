document.addEventListener('DOMContentLoaded', () => {
const checkbox = document.getElementById('fastForward');


chrome.storage.sync.get(['fastForward'], result => {
checkbox.checked = result.fastForward ?? true; // default true
});


checkbox.addEventListener('change', () => {
chrome.storage.sync.set({ fastForward: checkbox.checked });
});
});