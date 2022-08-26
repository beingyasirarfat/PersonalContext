var WORD = document.getElementById("tbody");
var LOCATION = '';
var LINK = '';
var CURRENT = 0;
var LIMIT = 10;
var SORT = '';

//set the saving location
chrome.storage.sync.get({ 'storage': 'cache', 'db': '' }, function (data) {
	if (data.storage == 'database') {
		LOCATION = data.storage;
		LINK = data.db;
		loadDoc(LINK + '?Content');
	} else {
		LOCATION = 'cache';
		loadNext('Content');
	}
});


//load data from cache
function loadNext(things, attrib = '') {

	let edge = CURRENT + LIMIT;

	//get the data on demand and sort if necessary
	chrome.storage.sync.get({ 'Words': [] }, function (data) {
		let Words = data.Words;

		if (things == 'Sort') { SORT = attrib; }

		if (SORT == 'Ascending') {
			//Sort Alphabetically Ascending
			Words.sort(function (a, b) {
				if (a.Word < b.Word) { return -1; }
				if (a.Word > b.Word) { return 1; }
				return 0;
			});
		} else if (SORT == 'Descending') {
			//Sort Alphabetically Ascending
			Words.sort(function (a, b) {
				if (a.Word > b.Word) { return -1; }
				if (a.Word < b.Word) { return 1; }
				return 0;
			});
		} else if (SORT == 'SerialDesc' || SORT == 'TimeDesc') {
			//Saving Serial and Saving time has same order
			Words.sort(function (a, b) {
				if (a.SaveTime > b.SaveTime) { return -1; }
				if (a.SaveTime < b.SaveTime) { return 1; }
				return 0;
			});
		}

		//Change the display limit if requested
		if (things == 'Limit' && attrib != '') {
			LIMIT = attrib;
			if (CURRENT + LIMIT <= Words.length)
				edge = CURRENT + LIMIT;
			else edge = Words.length;
		}

		//Controlled navigation
		if (things == 'Next') {
			if (Words.length - (CURRENT + LIMIT) >= 0)
				CURRENT = CURRENT + LIMIT;
			if (CURRENT + LIMIT < Words.length)
				edge = CURRENT + LIMIT;
			else edge = Words.length;
		}
		else if (things == 'Previous') {
			if (CURRENT - LIMIT >= 0) CURRENT = CURRENT - LIMIT;
			else CURRENT = 0;
			if (CURRENT + LIMIT <= Words.length) edge = CURRENT + LIMIT;
			else edge = Words.length;
		}

		//sending sliced(Limited Display) data
		updateDom(Words.slice(CURRENT, edge));

	});

}

//Load from database
//Server remembers attributes like sort and limit
//Not necessary here;
function loadDoc(LINK) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			updateDom(JSON.parse(this.responseText));
		}
	};
	xhttp.open("GET", LINK, true);
	xhttp.send();
}

//Updating Dom immediately after receiving new data collection
function updateDom(Collection) {
	WORD.innerHTML = " ";
	Collection.forEach((element) => {
		var tr = document.createElement("tr");
		var dom = "";
		dom += '<th scope="col" class="text-center">' + element.Serial + "</th>";
		dom += '<th scope="col" class="text-center">' + element.Word + "</th>";
		dom +=
			'<th scope="col" class="text-center">' + element.Definition + "</th>";
		dom +=
			'<th scope="col" class="text-center">' + element.Translation + "</th>";
		dom += '<th scope="col" class="text-center">' + element.SaveTime + "</th>";
		tr.innerHTML = dom;
		WORD.appendChild(tr);
	});
	dom = "";

	//Handlers for editing data values
	x = document.querySelectorAll("tr");
	for (i = 1; i < x.length; i++) {
		x[i].children[1].addEventListener("dblclick", () => ReadAloud(event.target.innerText));
		x[i].children[2].addEventListener("dblclick", () => UpdateWord(event, 2));
		x[i].children[3].addEventListener("dblclick", () => UpdateWord(event, 3));
	}
}

function ReadAloud(data) {
	chrome.tts.speak(data, { 'voiceName': 'Google US English' });
}

function UpdateWord(event, child) {
	let a = event.path[1].children[0].innerHTML;//Getting word serial number
	let b = event.path[1].children[child].innerHTML;//Get Current Definition/Translation

	//Convert table cell into input box with current data
	event.path[1].children[child].outerHTML = '<td class="form-group"> <input data-serial="' + a + '" class="form-control" value="' + b + '" autofocus> </td>';

	//DOM of input box that was injected
	let Input = event.path[1].children[child].lastElementChild;

	Input.onkeyup = function (event) {
		if (event.keyCode == 13) {
			if (LOCATION == 'database') {

				let String = "Serial=" + event.target.getAttribute('data-serial');
				if (child == 2) String += "&Definition=" + event.target.value;
				else if (child == 3) String += "&Translation=" + event.target.value;

				send(String);//to database

				//Update the DOM with updated value
				event.path[1].outerHTML = '<th scope="col" class="text-center">' + event.target.value + '</th>';

				return 0;
			} else {
				chrome.storage.sync.get('Words', function (data) {
					var Words = data.Words;
					var serial = event.target.getAttribute('data-serial');

					Words.forEach(word => {
						if (word.Serial == serial) {
							if (child == 2) word.Definition = event.target.value;
							else if (child == 3) word.Translation = event.target.value;
						}
					});

					chrome.storage.sync.set({ 'Words': Words }, function () {
						//update the DOM with updated value
						event.path[1].outerHTML = '<th scope="col" class="text-center">' + event.target.value + '</th>';
						return 0;
					});

				});
			}
		}
	}
};
function send(abc) {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", LINK, true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(abc);
}

function save() {

	let w = document.getElementById("w");
	let d = document.getElementById("d");
	let t = document.getElementById("t");

	if (LOCATION == 'database') {
		if (w.value == '') return;
		let abc = "Word=" + w.value + "&Definition=" + d.value + "&Translation=" + t.value;
		send(abc);
		flash('Congratulations! "' + w.value + '" is saved.');
		w.placeholder = ' "' + w.value + '" Saved';
		w.value = "";
		d.placeholder = d.value ? ' "' + d.value + '" Saved' : "";
		d.value = "";
		t.placeholder = t.value ? ' "' + t.value + '" Saved' : "";
		t.value = "";

	} else {
		if (w.value == '') return;
		chrome.storage.sync.get({ 'Words': [] }, (data) => {
			let obj = data.Words;
			let time = new Date().toISOString().slice(0, 10) + " " + new Date().toISOString().slice(11, 19);
			obj.push({ Serial: obj.length + 1, Word: w.value, Definition: d.value, Translation: t.value, SaveTime: time });
			chrome.storage.sync.set({
				'Words': obj
			}, () => {
				flash('Congratulations! "' + w.value + '" is saved.');
				w.placeholder = ' "' + w.value + '" Saved';
				w.value = "";
				d.placeholder = d.value ? ' "' + d.value + '" Saved' : "";
				d.value = "";
				t.placeholder = t.value ? ' "' + t.value + '" Saved' : "";
				t.value = "";
			});
		});
	}
	return 0;
}

document.getElementById("Next").onclick = () => {
	if (LOCATION == 'database') loadDoc(LINK + "?Navigate=Next");
	else loadNext('Next');
};
document.getElementById("Previous").onclick = () => {
	if (LOCATION == 'database') loadDoc(LINK + "?Navigate=Previous");
	else loadNext('Previous');
};
document.getElementById("Limit").onchange = () => {
	if (LOCATION == 'database') loadDoc(LINK + "?Limit=" + document.getElementById("Limit").value);
	else loadNext('Limit', document.getElementById("Limit").value);
};
document.getElementById("Sort").onchange = () => {
	if (LOCATION == 'database') loadDoc(LINK + "?Sort=" + document.getElementById("Sort").value);
	else loadNext('Sort', document.getElementById("Sort").value);
};

document.getElementById("Add").onclick = () => {

	var element = document.getElementById("Save");

	if (typeof element != "undefined" && element != null) {
		save();
		return false;
	} else {
		let tr = document.createElement("tr");
		let time = new Date().toISOString().slice(0, 10) + " " + new Date().toISOString().slice(11, 19);
		tr.setAttribute("id", "Save");
		let x = `<td scope="row"> 00 </td>

			<td class="Word text-capitalize"> <input class="form-control" placeholder="Word to Save" id="w" /> </td>

			<td class="Defination" > <input class="form-control" placeholder="Definition" id="d" /> </td>

			<td class="Translation"> <input class="form-control" placeholder="Translation" id="t" /> </td>
			
			<th scope="col" class="text-center">` + time + '</th>';

		tr.innerHTML = x;
		WORD.appendChild(tr);
		document.getElementById("Add").innerText = "Save Word";
	}
};

//Flash message
function flash(data) {
	var node = document.getElementById("snackbar");
	node.innerHTML = data;
	node.className = "show";
	setTimeout(() => { node.className = node.className.replace("show", "") }, 3000);
}
