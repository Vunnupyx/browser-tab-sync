let main = {
    init: function () {
        chrome.runtime.sendMessage({fn: 'openTabs', documentURL: document.URL})
    },
}
document.addEventListener('DOMContentLoaded', () => {
    main.init();
});
