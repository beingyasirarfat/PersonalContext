const tableHeader = document.getElementById("word");
const tableBody = document.getElementById("tableBody");

const getWordDefinition = async (word) => {
	if (!word) throw new Error("Word is required to get definition.");
	if (typeof word === "object") word = word.word;
	if (typeof word !== "string") throw new Error("Word must be a string.");
	console.log("Word Definition Loading From API for:", word);
	const { 0: wordObject } = await (await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)).json();
	return wordObject;
};

const getRandomWord = async () => {
	const { Words: storageWords } = await chrome.storage.local.get({ Words: [] });
	const collection = wordDefinitions[0];
	const collectionWords = Object.keys(collection);
	const totalWords = storageWords.length + collectionWords.length;

	const availableWords = () => collection[collectionWords[Math.floor(Math.random() * collectionWords.length)]][0];

	console.log("Cached words:", storageWords.length, "WordsCollection:", collectionWords.length);

	const randomValue = Math.random();
	let selectedWord;

	if (randomValue < storageWords.length * 10 && storageWords.length > 0) {
		const randomIndex = Math.floor(Math.random() * storageWords.length);
		selectedWord = storageWords[randomIndex];
		console.log("Selected word from cache:", selectedWord);

		if (!selectedWord.meanings || selectedWord.meanings.length === 0) {
			try {
				// get the word from object

				const definition = await getWordDefinition(selectedWord);
				storageWords[randomIndex] = definition;
				chrome.storage.local.set({ Words: storageWords });
				selectedWord = definition;
			} catch (error) {
				console.log(error);
				selectedWord = availableWords();
			}
		}
	} else {
		selectedWord = availableWords();
	}

	return selectedWord;
};

const addPhonetics = (phonetic, phonetics) => {
	const phoneticsRow = document.createElement("tr");
	const phoneticsHeader = document.createElement("th");

	phoneticsHeader.innerHTML += phonetic && phonetic !== "null" ? `${phonetic}&nbsp;&nbsp;` : "";

	phonetics.forEach(({ audio, text }) => {
		phoneticsHeader.innerHTML += `<td> ${text ?? ""} ${
			audio
				? `<span class="phoneticAudio">&nbsp;&nbsp;&#128264;<audio controls style="display:none;" src="${audio}"></audio></span>`
				: ""
		} </td>`;
	});

	phoneticsRow.appendChild(phoneticsHeader);
	tableBody.appendChild(phoneticsRow);

	document.querySelectorAll(".phoneticAudio").forEach((element) => {
		element.addEventListener("click", () => {
			const audioElement = element.querySelector("audio");
			if (audioElement) audioElement.play();
		});
	});
};

const addMeanings = (meanings) => {
	meanings.forEach(({ partOfSpeech, definitions }) => {
		definitions.forEach(({ definition, example, synonyms, antonyms }) => {
			const card = document.createElement("div");
			card.classList.add("card", "mb-2", "text-justify");
			card.style.background = "rgba(255, 255, 255, 0.1)";

			const cardBody = document.createElement("div");
			cardBody.classList.add("card-body");

			addKeyValuePairs(cardBody, {
				PartOfSpeech: partOfSpeech,
				Definition: definition,
				Example: example,
				Synonyms: synonyms?.join(", "),
				Antonyms: antonyms?.join(", "),
			});

			card.appendChild(cardBody);
			tableBody.appendChild(card);
		});
	});
};

const addKeyValuePairs = (parent, keyValuePairs) => {
	Object.entries(keyValuePairs).forEach(([key, value]) => {
		if (value) {
			const row = document.createElement("div");
			row.classList.add("row", "mb-1", "p-1");

			const keyColumn = document.createElement("div");
			keyColumn.classList.add("col-md-3", "font-weight-bold", "p-0");
			keyColumn.textContent = key + ":";

			const valueColumn = document.createElement("div");
			valueColumn.classList.add("col-md", "p-0");
			valueColumn.textContent = value;

			row.appendChild(keyColumn);
			row.appendChild(valueColumn);

			row.style.border = "1px solid rgba(0, 0, 0, 0.1)";
			row.style.borderRadius = "5px";
			// row.style.background = "rgba(255, 255, 255, 0.1)";

			parent.appendChild(row);
		}
	});
};

function renderJSON(wordObject) {
	if (!wordObject) return;
	console.log("Rendering JSON:", wordObject);
	tableBody.innerHTML = "";
	tableHeader.innerHTML = wordObject.word;

	addPhonetics(wordObject.phonetic, wordObject.phonetics);
	addMeanings(wordObject.meanings);
}

getRandomWord().then((word) => renderJSON(word));

tableHeader.addEventListener("dblclick", () => {
	const inputField = document.createElement("input");
	inputField.classList.add("form-control");
	inputField.value = tableHeader.textContent;
	tableHeader.innerHTML = "";
	tableHeader.appendChild(inputField);
	inputField.focus();

	const handleEvent = () => {
		getWordDefinition(inputField.value.trim()).then(renderJSON);
	};

	inputField.addEventListener("keydown", (event) => {
		event.key === "Enter" && handleEvent();
	});

	inputField.addEventListener("focusout", handleEvent);
});

(() => {
	const getSelectedWord = () => {
		const selectedText = window.getSelection().toString().trim();

		// Check if the selected text contains only one word
		if (selectedText && !/\s/.test(selectedText)) {
			getWordDefinition(selectedText)
				.then(renderJSON)
				.catch((error) => console.error("Error:", error));
		}
	};

	// Attach double click event listener
	document.addEventListener("dblclick", getSelectedWord);
})();
