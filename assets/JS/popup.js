const Save = document.getElementById("Save");
const Input = document.getElementById("Word");
const View = document.getElementById("ViewWords");
const Invert = document.getElementById("Invert");
const Notes = document.getElementById("Notes");
const AddNote = document.getElementById("AddNote");
const TableHead = document.getElementById("TableHead");

//Words
Invert.onclick = async function () {
  var intensity = 1;
  var no = Number(Input.value);
  if (Number.isInteger(no) && no > 0 && no < 100) {
    intensity = no / 100;
  }
  var activeTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  function Inv(intensity) {
    document.querySelectorAll("html").forEach((a) => {
      a.style.filter = `invert(${intensity}`;
    });
  }
  chrome.scripting.executeScript({
    target: { tabId: activeTab[0].id },
    func: Inv,
    args: [intensity],
  });
};

Save.onclick = function () {
  var WORD = document.getElementById("Word").value;
  if (WORD == "") return false;
  chrome.storage.sync.get({ storage: "cache", db: "" }, function (data) {
    //if storage isn't database, don't care about chche on/off.
    if (data.storage == "database") {
      var obj =
        "Word=" +
        WORD +
        "&Definition=" +
        DEFINITION +
        "&Translation=" +
        TRANSLATION;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          //if(this.responseText == 'success')
          Notify(WORD);
        }
      };
      xhttp.open("POST", data.db, true);
      xhttp.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );
      xhttp.send(obj);
    } else {
      chrome.storage.sync.get({ Words: [] }, function (data) {
        data.Words.push({ WORD });
        chrome.storage.sync.set({ Words: data.Words }, () => Notify(WORD));
      });
    }
  });
};

Input.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    if (event.altKey) AddNote.click();
    else if (event.ctrltKey) Invert.click();
    else if (!Number(Input.value)) Save.click();
  }
});

View.onclick = function () {
  chrome.tabs.create({
    url: "Words.html",
  });
  return false;
};

AddNote.onclick = function (e) {
  e.preventDefault();
  let value = Input.value;
  if (value != "") {
    chrome.storage.sync.get({ Notes: [] }, function (data) {
      let obj = data.Notes;
      if (!obj) obj = new Array();
      obj.push({ Note: value, done: false, time: Date.now() });
      chrome.storage.sync.set({ Notes: obj }, () => {
        // if CachedNotes is defined, then update it
        if (CachedNotes) {
          CachedNotes = obj;
          if (renderTable) renderTable();
        }
      });
    });
    Input.value = "";
    Notify(value + " is added to your tasks and ");
  }
};

Notes.onclick = function () {
  chrome.storage.local.remove("Facts", function () {
    console.log("Data cleared.");
  });
};

function Notify(WORD, SUCCESS = true) {
  if (SUCCESS) {
    document.getElementById("status-msg").innerHTML =
      'Congratulations! "' + WORD + '"&nbsp; is saved successfully!';
    document.getElementById("status-box").style.display = "inline";
    document.getElementById("Word").value = "";
    chrome.storage.sync.get({ sound: "on" }, function (data) {
      if (data.sound == "on") {
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
    document.getElementById("status-msg").innerHTML =
      '"' + WORD + "\" &nbsp; couldn't be saved";

    document.getElementById("status-box").style.display = "block";

    chrome.storage.sync.get({ sound: "on" }, function (data) {
      if (data.sound == "on") {
        chrome.tts.speak(
          '<?xml version="1.0"?><speak> <emphasis> Warning! </emphasis> ' +
            WORD +
            " Couldn't be saved. </speak>"
        );
      }
    });
  }
}
