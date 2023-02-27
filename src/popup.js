let app = {
    init: function () {
        const updateBtn = document.getElementById("update-btn");
        const fileInput = document.getElementById("file-input")

        updateBtn.addEventListener('click', function () {
            const file = fileInput.files[0];
            if (!file) {
                return;
            }
            readJSONFile(file)
                .then(json => chrome.runtime.sendMessage({
                    fn: 'setConfig', config: json
                }))
                .catch(alert);
        })

        async function readJSONFile(file) {
            return new Promise((resolve, reject) => {
                let fileReader = new FileReader();
                fileReader.onload = event => {
                    try {
                        resolve(JSON.parse(event.target.result))
                    } catch (err) {
                        reject(err)
                    }
                };
                fileReader.onerror = error => reject(error);
                fileReader.readAsText(file);
            });
        }
    },
}
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
