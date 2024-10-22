var CacheStorage = document.getElementById("cacheStorage");
var ServerStorage = document.getElementById("serverStorage");
var OptionsInputText = document.getElementById("optionsInputText");
var SaveSettings = document.getElementById("saveSettings");
var ResetSettings = document.getElementById("resetSettings");
var ExportToServer = document.getElementById("exportToServer");
var ExportToCSV = document.getElementById("exportToCSV");
var ImportFromCSV = document.getElementById("importFromCSV");
var ClearHistory = document.getElementById("clearHistory");
var CSVInput = document.getElementById("CSVInput");
var FlashMessage = document.getElementById("flashMessage");
var SaveStatus = document.getElementById("saveStatus");
var SoundFeedback = document.getElementById("soundFeedback");

CacheStorage.onclick = function () {
	ServerStorage.checked = false;
	OptionsInputText.disabled = true;
};

ServerStorage.onclick = function () {
	CacheStorage.checked = false;
	OptionsInputText.disabled = false;
};

SaveSettings.onclick = function (e) {
	e.preventDefault();
	let uri = OptionsInputText.value;
	if (ServerStorage.checked && uri == "") {
		flash("Please insert the database url correcectly", false);
		return false;
	} else if (ServerStorage.checked) {
		//fix uri,prepend http:// if unless http:// or https://
		uri = uri.indexOf("://") === -1 ? "http://" + uri : uri;
	}
	//say what! Yes, could be more readable, but you know
	chrome.storage.local.set(
		{
			Server: ServerStorage.checked ? true : false,
			ServerURL: uri ? uri : "",
			SoundFeedback: SoundFeedback.checked ? true : false,
		},
		() => (ServerStorage.checked ? flash('Database address set to "' + uri + '"') : flash("success")),
	);
};

ResetSettings.onclick = function (e) {
	e.preventDefault();
	if (confirm("You are going to lose the settings and data stored. Are you sure?")) {
		// clear all the data
		chrome.storage.local.clear(function () {
			var error = chrome.runtime.lastError;
			if (error) {
				console.error(error);
			}
		});
	}
};

ExportToServer.onclick = function (e) {
	e.preventDefault();
	chrome.storage.local.get({ Words: [], ServerURL: "" }, function (data) {
		var Words = data.Words;
		if (data.ServerURL == "") {
			flash("Please set your database correctly", false);
			return false;
		} else if (confirm("You are going to backup words to database.Confirm?")) {
			// convert into json
			Words = JSON.stringify(Words);
			//send data to server
			fetch(data.ServerURL, {
				method: "POST",
				body: Words,
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
						flash("Exported all data to database");
					} else {
						flash("Error: " + data.message, false);
					}
				})
				.catch((error) => {
					flash("Error: " + error, false);
				});
		}
	});
};

ExportToCSV.onclick = function (e) {
	e.preventDefault();
	chrome.storage.local.get({ Words: [] }, function (data) {
		console.log(data.Words);
		if (data.Words.length == 0) {
			flash("No data to export", false);
			return false;
		}
		var CSVFILE = prepareCSV(data.Words);
		var downloadLink = document.createElement("a");
		downloadLink.download = "Yabulary.csv";
		downloadLink.href = "data:text/csv;charset=utf-8," + encodeURI(CSVFILE);
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
		flash("Exported all data to csv");
	});
};

ClearHistory.onclick = function (e) {
	e.preventDefault();
	if (confirm("You are going to clear all the words saved locally. Continue?")) {
		chrome.storage.local.set({ Words: [], Notes: [], Facts: [] }, () => flash("success"));
	}
};

ImportFromCSV.onclick = function (e) {
	e.preventDefault();
	CSVInput.click();
};

// CSVInput.onchange = function (e) {
//   e.preventDefault();
//   if (!confirm("You are going to import words from csv. Continue?"))
//     return false;
//   var reader = new FileReader();
//   reader.addEventListener("load", function () {
//     allText = this.result;
//     allTextLines = allText.split(/\r\n|\n/);
//     chrome.storage.local.get({ Words: [] }, function (data) {
//       let newWords = [];
//       allTextLines.forEach((element) => {
//         entries = element.split(",");
//         if (entries.length > 1)
//           newWords.push({
//             Word: entries[0],
//             Definition: entries[1],
//             Translation: entries[2],
//             Time: entries[3] ?? Date.now().toString,
//           });
//       });
//       chrome.storage.local.set({ Words: [...data.Words, ...newWords] }, () =>
//         flash("CSV Data imported successfuly")
//       );
//     });
//   });
//   reader.readAsText(cSVInput.files.item(0));
// };

//on options page, load the settings
(function () {
	chrome.storage.local.get({ Server: false, ServerURL: "", SoundFeedback: true }, function (data) {
		if (data.Server) {
			CacheStorage.checked = false;
			ServerStorage.checked = true;
			OptionsInputText.disabled = false;
			OptionsInputText.value = data.ServerURL;
		} else {
			CacheStorage.checked = true;
			ServerStorage.checked = false;
			OptionsInputText.disabled = true;
		}
	});

	chrome.runtime.getPackageDirectoryEntry((root) => {
		root.getDirectory("wallpapers", {}, (dirEntry) => {
			const reader = dirEntry.createReader();
			let readFiles = [];
			const readEntries = () => {
				reader.readEntries((entries) => {
					entries.length > 0
						? ((readFiles = [...readFiles, ...entries]), readEntries())
						: chrome.storage.local.set({ Wallpapers: readFiles.map((file) => file.name) }, () => {
								console.log("Total Wallpapers indexed: ", readFiles.length);
						  });
				});
			};
			readEntries();
		});
	});
})();

function flash(flashdata, status = true) {
	FlashMessage.innerHTML = flashdata;
	if (status) FlashMessage.setAttribute("class", "alert-success");
	else FlashMessage.setAttribute("class", "alert-danger");
	FlashMessage.style.display = "block";
	// fade out the flash reducing the opacity by 0.1 every 0.1 seconds
	var fadeOut = setInterval(function () {
		if (!FlashMessage.style.opacity) {
			FlashMessage.style.opacity = 1;
		}
		if (FlashMessage.style.opacity > 0) {
			FlashMessage.style.opacity -= 0.05;
		} else {
			clearInterval(fadeOut);
		}
	}, 100);
	//hide the flash message
	setTimeout(() => {
		FlashMessage.style.display = "none";
	}, 5000);
}

const prepareCSV = (data) => {
	var csv = "";
	data.forEach((element) => {
		console.log("element", element);
		csv += element.word + ",";
		csv += addPhonetics(element.phonetic, element.phonetics) + ",";
		csv += addMeanings(element.meanings) + "\n";
	});
	return csv;
};

const addPhonetics = (phonetic, phonetics) => {
	let phoneticsString = "";
	if (phonetic) phoneticsString += phonetic + "||";
	if (phonetics) {
		//for each phonetic with index
		phonetics.forEach((phonetic, index) => {
			phoneticsString += phonetic.text;
			if (index != phonetics.length - 1) phoneticsString += "||";
		});
	}
	return phoneticsString;
};

const addMeanings = (meanings) => {
	let meaningsString = "";
	if (meanings) {
		meanings.forEach(({ partOfSpeech, definitions, index }) => {
			meaningsString += partOfSpeech + "==";
			definitions.forEach(({ definition, example }, index) => {
				meaningsString += definition;
				if (index != definitions.length - 1) meaningsString += "||";
			});
			meaningsString += "##";
		});
	}
	return meaningsString;
};
