//for every unfinished Tasks.task
// if task.done is false and task.time is more than a day create notification
// otherwise do nothing


chrome.runtime.onInstalled.addListener(function () {
	chrome.contextMenus.create({
		id: "PersoanlContext",
		title: "Save Word/Task",
		contexts: ["selection"],
	});
	//create multiple context menus

	// chrome.contextMenus.create({
	// 	"title": "Read Out Loud",
	// 	"contexts": ["selection"],
	// 	"id": "readOutLoud"
	// });
});
// chrome.contextMenus.onClicked.addListener(function (info, tab) {
// 	console.log(info);
// 	console.log(tab);
// });

chrome.contextMenus.onClicked.addListener(function (clickData) {

	if (clickData.menuItemId == "PersoanlContext" && clickData.selectionText) {
		chrome.storage.sync.get({ 'storage': "", 'db': '', 'sound': 'on' }, function (data) {
			if (data.storage == "database") {
				var word = "Word=" + clickData.selectionText;
				var xhttp = new XMLHttpRequest();
				xhttp.open("POST", data.db, true);
				xhttp.onreadystatechange = function () {
					if (this.readyState == 4 && this.status == 200) {
						//if(this.responseText == 'success')
						if (data.sound == 'on') {
							readOutLoud(clickData.selectionText + "is saved to your database");
						}
					}
				};
				xhttp.setRequestHeader(
					"Content-type",
					"application/x-www-form-urlencoded"
				);
				xhttp.send(word);
			} else {
				chrome.storage.sync.get({ Words: [], 'sound': 'on' }, function (data) {
					let obj = data.Words;
					let time = new Date().toISOString().slice(0, 10) + " " + new Date().toISOString().slice(11, 19);
					obj.push({ Serial: obj.length + 1, Word: clickData.selectionText, Definition: '', Translation: '', SaveTime: time });
					chrome.storage.sync.set({
						'Words': obj
					}, function () {
						if (data.sound == 'on') {
							readOutLoud(clickData.selectionText + " is saved to your dictionary");
						}
					});
				});
			}
		});
	}
});

async function readOutLoud(sentences) {
	chrome.tts.speak(sentences, {
		"voiceName": "Google US English",
		"enqueue": true
	});
}
