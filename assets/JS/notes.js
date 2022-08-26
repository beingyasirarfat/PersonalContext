const AddNote = document.getElementById("AddNote");
const TableBody = document.getElementById("TableBody");
const TableHead = document.getElementById("TableHead");

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
			obj.push({ Task: value, done: false ,time: new Date()});
			chrome.storage.sync.set({ 'Tasks': obj }, () => renderTable(obj));
		});
		Input.value = "";

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
		x[i].children[3].addEventListener("click", function () {
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