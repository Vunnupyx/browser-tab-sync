# Chrome extension

## General Idea

When user navigates his Chrome browser to a particular URL, a several additional browser tabs will open automatically.

![Jul-24-2023 15-13-17](https://github.com/Vunnupyx/browser-tab-sync/assets/53125611/44ffcc2d-ab70-4f1c-a433-5a7e7f796b97)

### Installation Instructions
**Google Chrome / Microsoft Edge** (Custom sites supported)
1. Download this repo as a [ZIP file from GitHub](https://github.com/Vunnupyx/browser-tab-sync/archive/main.zip).
1. Unzip the file and you should have a folder named `browser-tab-sync-main`.
1. In Chrome/Edge go to the extensions page (`chrome://extensions` or `edge://extensions`).
1. Enable Developer Mode.
1. Drag the `browser-tab-sync-main` folder anywhere on the page to import it (do not delete the folder afterwards).
1. From the root directory, upload `config.json`

### Config file:

```javascript
{
  "myWikiTab": {
    "sourceUrl": "https://gitlab.com/solidbranch/clight/clight/-/issues/{TID}",
    "targetUrl": "https://en.wikipedia.org/wiki/{TID}",
    "repl": {
      "128": { "to": "Google_Chrome" },
      "142": { "to": "Code_refactoring" },
      "181": { "to": "SOLID" },
      ...
    },
    "browserTabSyncMode": "two-way"
  },
  "myChromeDownloadTab": {
    "sourceUrl": "https://gitlab.com/solidbranch/clight/clight/-/issues/{TID}",
    "targetUrl": "https://www.google.com/intl/{TID}/chrome/",
    "repl": {
      "128": { "to": "ru_ru" },
      "142": { "to": "en_us" },
      "181": { "to": "de_de" },
      ...
    }
  },
  "myTab3": {...}, 
}
```
