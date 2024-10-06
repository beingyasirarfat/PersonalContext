const TableBody = document.getElementById("notesTable");
var CachedNotes = [];

function renderTable() {
	console.log("Notes Cached:", CachedNotes.length, "\n\nFacts Count:", facts.length);
	TableBody.innerHTML = "";

	// Render Notes
	for (let i = 0; i < CachedNotes.length; i++) {
		const tr = document.createElement("tr");
		tr.style.backgroundColor = "#F0F0F04D";
		tr.innerHTML += `<th scope="col" class="text-center"> ${i + 1} </th>`;
		tr.innerHTML += `<th scope="col" class="text-center">${CachedNotes[i].Note} </th>`;
		tr.innerHTML += `<th scope="col" class="text-center"><i class="done-icon" data-index="${i}">${
			CachedNotes[i].done ? "&#10003;" : "&#10008;"
		} </i> </th>`;
		tr.innerHTML += `<th scope="col" class="text-center"><i class="delete-icon" data-index="${i}">&#128465;</i></th>`;
		TableBody.appendChild(tr);
	}

	// Render Facts if Notes are less than 10
	if (CachedNotes.length < 10) {
		const factsToShow = getRandomFacts(15 - CachedNotes.length); // Get required number of random facts
		for (let i = 0; i < factsToShow.length; i++) {
			const tr = document.createElement("tr");
			tr.innerHTML += `<th scope="col" class="text-center"> ${CachedNotes.length + i + 1} </th>`;
			tr.innerHTML += `<th scope="col" class="text-center">${factsToShow[i]}</th>`;
			tr.innerHTML += `<th scope="col" class="text-center"><i class="delete-icon" data-index="${
				CachedNotes.length + i
			}">&#128465;</i></th>`;
			TableBody.appendChild(tr);
		}
	}

	addEventListeners();
}

// Function to get random facts
function getRandomFacts(count) {
	const shuffledFacts = facts.sort(() => 0.5 - Math.random());
	return shuffledFacts.slice(0, count);
}

// Add event listeners for done and delete icons
function addEventListeners() {
	const doneIcons = document.getElementsByClassName("done-icon");
	for (let i = 0; i < doneIcons.length; i++) {
		doneIcons[i].addEventListener("dblclick", function () {
			const index = this.getAttribute("data-index");
			CachedNotes[index].done = !CachedNotes[index].done;
			chrome.storage.sync.set({ Notes: CachedNotes }, () => {
				renderTable();
			});
		});
	}

	const deleteIcons = document.getElementsByClassName("delete-icon");
	for (let i = 0; i < deleteIcons.length; i++) {
		deleteIcons[i].addEventListener("dblclick", function () {
			const index = this.getAttribute("data-index");
			if (index < CachedNotes.length) {
				CachedNotes.splice(index, 1);
				chrome.storage.sync.set({ Notes: CachedNotes }, () => {
					renderTable();
				});
			} else {
				// No need to do anything for deleted facts since we're using the array directly.
				renderTable();
			}
		});
	}
}

(function () {
	chrome.storage.sync.get({ Notes: [] }, function (data) {
		CachedNotes = data.Notes;
		renderTable(); // Call renderTable here since facts is available.
	});
})();
