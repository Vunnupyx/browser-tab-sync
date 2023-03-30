let main = {
    init: function () {
        chrome.runtime.sendMessage({fn: 'loadMainTab', documentURL: document.URL})
    },
}
document.addEventListener('DOMContentLoaded', () => {
    main.init();
});
