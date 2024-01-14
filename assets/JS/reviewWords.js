var WORD = document.getElementById("tbody");
var LOCATION = "";
var LINK = "";
var CURRENT = 0;
var LIMIT = 10;
var SORT = "";

//set the saving location
chrome.storage.sync.get({ Server: "", ServerURL: "" }, function (Settings) {
  if (
    Settings.Server &&
    Settings.Server != "" &&
    Settings.ServerURL &&
    Settings.ServerURL != ""
  ) {
    LOCATION = "database";
    LINK = Settings.ServerURL;
    loadDoc(LINK);
  } else {
    LOCATION = "cache";
    loadNext("Next");
  }
});

//load data from cache
function loadNext(things, attrib = "") {
  let edge = CURRENT + LIMIT;
  chrome.storage.local.get({ Words: [] }, (data) => {
    updateDom(data.Words);
  });
}

//Load from database
//Server remembers attributes like sort and limit
//Not necessary here;
// function loadDoc(LINK) {
//   fetch(LINK)
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.length == 0) {
//         flash("No more words to display");
//         return 0;
//       }
//       updateDom(data);
//     });
// }

//Updating Dom immediately after receiving new data collection
function updateDom(Collection) {
  console.log(Collection);
  WORD.innerHTML = " ";
  let index = 0;
  Collection.forEach((element) => {
    let tr = document.createElement("tr");
    let dom = "";
    let word = element.word;
    let definition = "";
    let synonyms = "";
    let antonyms = "";
    if (element.meanings) {
      element.meanings.forEach((meaning) => {
        meaning.definitions.forEach((def, i) => {
          if (def.definition !== "null" && def.definition !== undefined) {
            if (i == 0) {
              definition += "<details>";
              definition += "<summary> " + def.definition + "</summary>";
            } else {
              definition += "<p>" + def.definition + "</p>";
            }
          }
          if (
            def.synonyms !== null &&
            def.synonyms !== undefined &&
            def.synonyms.length > 0
          ) {
            synonyms += def.synonyms + "<br>";
          }
          if (
            def.antonyms !== null &&
            def.antonyms !== undefined &&
            def.antonyms.length > 0
          ) {
            antonyms += def.antonyms + "<br>";
          }
        });
      });
    }
    definition += "</details>";
    dom +=
      '<th scope="col" class="text-center" data-aria="' +
      index +
      '">' +
      (index + 1) +
      "</th>";
    dom += '<th scope="col" class="text-center">' + word + "</th>";
    dom += '<th scope="col" class="text-left">' + definition + "</th>";
    dom += '<th scope="col" class="text-center">' + synonyms + "</th>";
    dom += '<th scope="col" class="text-center">' + antonyms + "</th>";
    tr.innerHTML = dom;
    WORD.appendChild(tr);
    index++;
  });
  dom = "";

  //Handlers for editing data values
  x = document.querySelectorAll("tr");
  for (i = 1; i < x.length; i++) {
    x[i].children[1].addEventListener("dblclick", () =>
      ReadAloud(event.target.innerText)
    );
  }
}

function ReadAloud(data) {
  chrome.tts.speak(data, { voiceName: "Google US English" });
}

// function send(abc) {
//   var xhttp = new XMLHttpRequest();
//   xhttp.open("POST", LINK, true);
//   xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//   xhttp.send(abc);
// }

// function save() {
//   let w = document.getElementById("w");
//   let d = document.getElementById("d");
//   let t = document.getElementById("t");

//   if (LOCATION == "database") {
//     if (w.value == "") return;
//     let abc =
//       "Word=" + w.value + "&Definition=" + d.value + "&Translation=" + t.value;
//     send(abc);
//     flash('Congratulations! "' + w.value + '" is saved.');
//     w.placeholder = ' "' + w.value + '" Saved';
//     w.value = "";
//     d.placeholder = d.value ? ' "' + d.value + '" Saved' : "";
//     d.value = "";
//     t.placeholder = t.value ? ' "' + t.value + '" Saved' : "";
//     t.value = "";
//   } else {
//     if (w.value == "") return;
//     chrome.storage.sync.get({ Words: [] }, (data) => {
//       let obj = data.Words;
//       let time =
//         new Date().toISOString().slice(0, 10) +
//         " " +
//         new Date().toISOString().slice(11, 19);
//       obj.push(w.value);
//       chrome.storage.sync.set(
//         {
//           Words: obj,
//         },
//         () => {
//           flash('Congratulations! "' + w.value + '" is saved.');
//           w.placeholder = ' "' + w.value + '" Saved';
//           w.value = "";
//           d.placeholder = d.value ? ' "' + d.value + '" Saved' : "";
//           d.value = "";
//           t.placeholder = t.value ? ' "' + t.value + '" Saved' : "";
//           t.value = "";
//         }
//       );
//     });
//   }
//   return 0;
// }

// document.getElementById("Next").onclick = () => {
//   if (LOCATION == "database") loadDoc(LINK + "?Navigate=Next");
//   else loadNext("Next");
// };
// document.getElementById("Previous").onclick = () => {
//   if (LOCATION == "database") loadDoc(LINK + "?Navigate=Previous");
//   else loadNext("Previous");
// };
// document.getElementById("Limit").onchange = () => {
//   if (LOCATION == "database")
//     loadDoc(LINK + "?Limit=" + document.getElementById("Limit").value);
//   else loadNext("Limit", document.getElementById("Limit").value);
// };
// document.getElementById("Sort").onchange = () => {
//   if (LOCATION == "database")
//     loadDoc(LINK + "?Sort=" + document.getElementById("Sort").value);
//   else loadNext("Sort", document.getElementById("Sort").value);
// };

// document.getElementById("Add").onclick = () => {
//   var element = document.getElementById("Save");

//   if (typeof element != "undefined" && element != null) {
//     save();
//     return false;
//   } else {
//     let tr = document.createElement("tr");
//     let time =
//       new Date().toISOString().slice(0, 10) +
//       " " +
//       new Date().toISOString().slice(11, 19);
//     tr.setAttribute("id", "Save");
//     let x =
//       `<td scope="row"> 00 </td>

// 			<td class="Word text-capitalize"> <input class="form-control" placeholder="Word to Save" id="w" /> </td>

// 			<td class="Defination" > <input class="form-control" placeholder="Definition" id="d" /> </td>

// 			<td class="Translation"> <input class="form-control" placeholder="Translation" id="t" /> </td>

// 			<th scope="col" class="text-center">` +
//       time +
//       "</th>";

//     tr.innerHTML = x;
//     WORD.appendChild(tr);
//     document.getElementById("Add").innerText = "Save Word";
//   }
// };

// //Flash message
// function flash(data) {
//   var node = document.getElementById("snackbar");
//   node.innerHTML = data;
//   node.className = "show";
//   // fade out , reduce opacity every 0.1s
//   var fade = setInterval(function () {
//     if (!node.style.opacity) {
//       node.style.opacity = 1;
//     }
//     if (node.style.opacity > 0) {
//       node.style.opacity -= 0.1;
//     } else {
//       clearInterval(fade);
//     }
//   }, 100);
// }
