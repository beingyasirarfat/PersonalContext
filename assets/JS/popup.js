const Save = document.getElementById("Save");
const Input = document.getElementById("Word");
const View = document.getElementById("ViewWords");
const Invert = document.getElementById("Invert");
const Notes = document.getElementById("Notes");
const AddNote = document.getElementById("AddNote");
const TableBody = document.getElementById("TableBody");
const TableHead = document.getElementById("TableHead");


//Words
Invert.onclick = function () {
	var intensity = 1;
	var no = Number(Input.value);
	if (Number.isInteger(no)) {
		if (no > 0 && no < 100) {
			intensity = no / 100;
		}
	}
	chrome.tabs.executeScript(null, { code: `document.querySelectorAll("html").forEach(a=>a.style.filter = "invert(${intensity})")` }, function () { });
}
Save.onclick = function () {

	var WORD = document.getElementById("Word").value;
	var DEFINITION = document.getElementById("Definition").value;
	var TRANSLATION = document.getElementById("Translation").value;
	if (WORD == "") return false;

	chrome.storage.sync.get({ 'storage': 'cache', 'db': '' }, function (data) {
		//if storage isn't database, don't care about chche on/off.
		if (data.storage == 'database') {

			var obj = "Word=" + WORD + "&Definition=" + DEFINITION + "&Translation=" + TRANSLATION;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					//if(this.responseText == 'success')
					Notify(WORD);
				}
			};
			xhttp.open("POST", data.db, true);
			xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhttp.send(obj);

		} else {

			chrome.storage.sync.get({ 'Words': [] }, function (data) {
				let obj = data.Words;

				let time = new Date().toISOString().slice(0, 10) + " " + new Date().toISOString().slice(11, 19);

				obj.push({ Serial: obj.length + 1, Word: WORD, Definition: DEFINITION, Translation: TRANSLATION, SaveTime: time });

				chrome.storage.sync.set({ 'Words': obj }, () => Notify(WORD));
			});
		}
	});

};

function Notify(WORD, SUCCESS = true) {

	if (SUCCESS) {

		document.getElementById("status-msg").innerHTML =
			'Congratulations! "' + WORD + '"&nbsp; is saved successfully!';
		document.getElementById("status-box").style.display = "inline";
		document.getElementById("Word").value = "";
		chrome.storage.sync.get({ 'sound': 'on' }, function (data) {
			if (data.sound == 'on') {
				chrome.tts.speak(
					'<?xml version="1.0"?>' +
					"<speak>" +
					"  Congratulations! <emphasis> " +
					WORD +
					" </emphasis> " +
					" is saved successfully." +
					"</speak>"
				);
			}
		});

	} else {

		document.getElementById("status-msg").innerHTML = '"' + WORD + '" &nbsp; couldn\'t be saved';

		document.getElementById("status-box").style.display = "block";

		chrome.storage.sync.get({ 'sound': 'on' }, function (data) {

			if (data.sound == 'on') {
				chrome.tts.speak(
					'<?xml version="1.0"?><speak> <emphasis> Warning! </emphasis> ' +
					WORD +
					" Couldn't be saved. </speak>"
				);
			}

		});

	}
}

Input.addEventListener("keyup", function (event) {
	if (event.keyCode === 13) {
		event.preventDefault();
		//if input is multi word addnote click
		if (Input.value.indexOf(" ") > -1) AddNote.click();
		else Save.click();
	}
});


View.onclick = function () {
	chrome.tabs.create({
		url: "Words.html"
	});
	return false;
};
//////////////////
//Tasks Functions//
chrome.storage.sync.get({ 'Tasks': new Array() }, function (data) {
	let Tasks = data.Tasks;
	renderTable(Tasks);
});

AddNote.onclick = function (e) {
	e.preventDefault();
	let value = Input.value;
	if (value != "") {
		chrome.storage.sync.get("Tasks", function (data) {
			let obj = data.Tasks;
			if (!obj) obj = new Array();
			obj.push({ Task: value, done: false ,time: Date.now()});
			chrome.storage.sync.set({ 'Tasks': obj }, () => renderTable(obj));
		});
		Input.value = "";
		Notify(value + " is added to your tasks and ");

	}
}

function renderTable(Tasks) {
	TotalTasks = Tasks.length;

	//Populate the table
	TableBody.innerHTML = '';
	let th = '<th scope="col" class="text-center">';
	let the = "</th>";
	for (let i = 0; i < Tasks.length; i++) {
		let dom = "";
		const tr = document.createElement('tr');
		dom += th + (i+1) + the;
		dom += th + Tasks[i].Task + the;
		if (Tasks[i].done) dom += th + '<i>&#10003;</i>' + the;
		else dom += th + '<i>&#10008;</i>' + the;
		dom += th + '<i>&#128465;</i>' + the;
		tr.innerHTML = dom;
		TableBody.appendChild(tr);
	}

	//Add event Listerner to all
	let x = document.querySelectorAll('tr');
	for (i = 0; i < x.length; i++) {
		x[i].children[2].addEventListener("dblclick", function () {
			UpdateTask(this.parentElement.children[0].innerHTML - 1, 0);
		});
		x[i].children[3].addEventListener("dblclick", function () {
			UpdateTask(this.parentElement.children[0].innerHTML - 1, 1);
		});
	}
	if (Tasks.length == 0) {
		TableHead.innerHTML = "No Tasks! Hurray!";
	}
}

function UpdateTask(index = 0, type = 'done') {
	chrome.storage.sync.get("Tasks", function (data) {
		let obj = data.Tasks;
		if (type == 1) {
			obj.splice(index, 1);
		}
		//if type is false then change the done value
		else {
			obj[index].done = !obj[index].done;
		}
		chrome.storage.sync.set({ "Tasks": obj }, () => { renderTable(obj) });
	});
}

chrome.tts.getVoices(
	function(voices) {
	  for (var i = 0; i < voices.length; i++) {
		console.log('Voice ' + i + ':');
		console.log('  name: ' + voices[i].voiceName);
		console.log('  lang: ' + voices[i].lang);
		console.log('  extension id: ' + voices[i].extensionId);
		console.log('  event types: ' + voices[i].eventTypes);
	  }
	}
  );