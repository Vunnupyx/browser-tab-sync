let app = {
    config: {},
    init: function () {
        const updateBtn = document.querySelector("#update-btn");

        chrome.runtime.sendMessage({fn: "getConfig"}, function (response) {
            app.config = response;
            console.log(app.config)
        })

        updateBtn.addEventListener('click', function () {

            chrome.runtime.sendMessage({fn: 'setConfig', config: true});
        })
    }
}
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
