const TableBody = document.getElementById("notesTable");
var CachedNotes = [];
var CachedFacts = [];

function renderTable() {
  console.log(
    "Notes Cached:",
    CachedNotes.length,
    "\n\nFacts Cached:",
    CachedFacts.length
  );
  TableBody.innerHTML = "";
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
  if (CachedNotes.length < 10) {
    for (let i = 0; i < CachedFacts.length; i++) {
      const tr = document.createElement("tr");
      tr.innerHTML += `<th scope="col" class="text-center"> ${
        CachedNotes.length + i + 1
      } </th>`;
      tr.innerHTML += `<th scope="col" class="text-center">${CachedFacts[i]}</th>`;
      tr.innerHTML += `<th scope="col" class="text-center"><i class="delete-icon" data-index="${
        CachedNotes.length + i
      }">&#128465;</i></th>`;
      TableBody.appendChild(tr);
    }
  }

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
        CachedFacts.splice(index - CachedNotes.length, 1);
        chrome.storage.local.set({ Facts: CachedFacts }, () => {
          renderTable();
        });
      }
    });
  }
}

(function () {
  chrome.storage.sync.get({ Notes: [] }, function (data) {
    CachedNotes = data.Notes;
  });
  chrome.storage.local.get({ Facts: [] }, function (data) {
    CachedFacts = data.Facts;
    if (CachedFacts.length < 10) {
      fetch("https://api.api-ninjas.com/v1/facts?limit=50", {
        method: "GET",
        headers: {
          "X-Api-Key": "V/Sd7ifoZrgiNVeU1AjPHA==5zP8Z7Osej8bSxHh",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const newFacts = data.map((item) => item.fact);
          CachedFacts = [...newFacts, ...CachedFacts];
          chrome.storage.local.set({ Facts: CachedFacts }, function () {
            console.log("New Facts Cached", CachedFacts);
            renderTable();
          });
        });
    } else {
      renderTable();
    }
  });
})();
