chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "SaveWord",
    title: "Save Word",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    title: "Save Note",
    contexts: ["selection"],
    id: "SaveNote",
  });

  chrome.contextMenus.create({
    title: "Read Out Loud",
    contexts: ["selection"],
    id: "ReadOutLoud",
  });
});

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId == "SaveWord" && clickData.selectionText) {
    chrome.storage.local.get({ Words: [] }, function (data) {
      data.Words.push({ word: clickData.selectionText.trim() });
      chrome.storage.local.set({ Words: data.Words });
    });
  } else if (clickData.menuItemId == "SaveNote" && clickData.selectionText) {
    chrome.storage.sync.get({ Notes: [] }, function (data) {
      let obj = data.Notes;
      if (!obj) obj = new Array();
      obj.push({
        Note: clickData.selectionText,
        done: false,
        time: Date.now(),
      });
      chrome.storage.sync.set({ Notes: obj }, () => {
        // if CachedNotes is defined, then update it
        if (CachedNotes) {
          CachedNotes = obj;
          renderTable();
        }
      });
    });
  } else if (clickData.menuItemId == "ReadOutLoud" && clickData.selectionText) {
    chrome.tts.speak(clickData.selectionText, { rate: 0.7 });
  }
});
