const TableBody = document.getElementById("notesTable");
var CachedNotes = [];
var CachedFacts = [];

function renderTable() {
	TableBody.innerHTML = "";

	for (let i = 0; i < CachedNotes.length; i++) {
		const tr = createTableRow(i + 1, CachedNotes[i].Note, CachedNotes[i].done, i);
		TableBody.appendChild(tr);
	}

	if (CachedNotes.length < 10) {
		for (let i = 0; i < CachedFacts.length; i++) {
			const tr = createTableRow(CachedNotes.length + i + 1, CachedFacts[i], false, CachedNotes.length + i);
			TableBody.appendChild(tr);
		}
	}

	addDoubleClickListeners(".done-icon", (index) => {
		CachedNotes[index].done = !CachedNotes[index].done;
		chrome.storage.sync.set({ Notes: CachedNotes }, renderTable);
	});

	addDoubleClickListeners(".delete-icon", (index) => {
		if (index < CachedNotes.length) {
			CachedNotes.splice(index, 1);
			chrome.storage.sync.set({ Notes: CachedNotes }, renderTable);
		} else {
			CachedFacts.splice(index - CachedNotes.length, 1);
			chrome.storage.local.set({ Facts: CachedFacts }, renderTable);
		}
	});
}

function createTableRow(index, content, isDone, dataIndex) {
	const tr = document.createElement("tr");
	tr.style.backgroundColor = "#F0F0F04D";
	tr.innerHTML += `<th scope="col" class="text-center">${index}</th>`;
	tr.innerHTML += `<th scope="col" class="text-center">${content}</th>`;
	tr.innerHTML += `<th scope="col" class="text-center"><i class="done-icon" data-index="${dataIndex}">${
		isDone ? "&#10003;" : "&#10008;"
	}</i></th>`;
	tr.innerHTML += `<th scope="col" class="text-center"><i class="delete-icon" data-index="${dataIndex}">&#128465;</i></th>`;
	return tr;
}

function addDoubleClickListeners(selector, callback) {
	const icons = document.querySelectorAll(selector);
	icons.forEach((icon) => {
		icon.addEventListener("dblclick", function () {
			const index = this.getAttribute("data-index");
			callback(index);
		});
	});
}

(function () {
	chrome.storage.sync.get({ Notes: [] }, function (data) {
		CachedNotes = data.Notes;
	});

	chrome.storage.local.get({ Facts: [] }, function (data) {
		CachedFacts = data.Facts;
		if (CachedFacts.length < 10) {
			fetch("https://api.api-ninjas.com/v1/facts", {
				method: "GET",
				headers: { "X-Api-Key": "R1pBUxmshf4F6zN6RBXrog==t85CuM3lvYYeX8T1" },
			})
				.then((response) => response.json())
				.then((data) => {
					const newFacts = data.map((item) => item.fact);
					CachedFacts = [...newFacts, ...CachedFacts];
					chrome.storage.local.set({ Facts: CachedFacts }, renderTable);
				});
		} else {
			renderTable();
		}
	});
})();
