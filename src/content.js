let content = {
    init: function () {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            //listen for url change
        })
    },
}
document.addEventListener('DOMContentLoaded', () => {
    content.init();
});