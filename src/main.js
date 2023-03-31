let main = {
    init: function () {
        chrome.runtime.sendMessage({fn: 'loadTab', documentURL: document.URL});
    },
}
document.addEventListener('DOMContentLoaded', () => {
    main.init();
});
