const tableHeader = document.getElementById("word");
const tableBody = document.getElementById("tableBody");

const getWordDefinition = async (word) => {
  if (!word || word === "" || word === undefined) {
    throw new Error("Word is required to get definition.");
  }
  console.log("Word Definition Loading From API for:", word);
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  const response = await fetch(url);
  const data = await response.json();
  const wordObject = data[0];
  wordObject.word = word;
  return wordObject;
};

const getRandomWord = async () => {
  const storageWords = (await chrome.storage.local.get("Words")).Words || [];
  const collectionWithDefinitions = wordDefinitions[0];
  const collectionWords = Object.keys(collectionWithDefinitions);
  const collectionLength = collectionWords.length;

  const availableWords = () => {
    console.log("Word Loading From Available Words Collection.");
    const selectedWordIndex = Math.floor(Math.random() * collectionLength);
    const selectedWordEntry =
      collectionWithDefinitions[collectionWords[selectedWordIndex]];
    return selectedWordEntry[0];
  };

  const totalWords = storageWords.length + collectionLength;
  const probabilityA = storageWords.length / totalWords;
  const probabilityB = collectionLength / totalWords;

  console.log(
    "Cached words:",
    storageWords.length,
    "WordsCollection:",
    collectionLength
  );

  const randomValue = Math.random();
  let selectedWord;

  if (randomValue < probabilityA && storageWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * storageWords.length);
    selectedWord = storageWords[randomIndex];
    console.log("Stored Words Collection:", storageWords);
    console.log("Word Loading From Cached Words Collection.", selectedWord);

    if (!selectedWord.meanings || selectedWord.meanings.length === 0) {
      try {
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

  phoneticsHeader.innerHTML +=
    phonetic && phonetic !== "null" ? phonetic + "&nbsp;&nbsp;" : "";

  phonetics.forEach((phonetic) => {
    const audio = phonetic.audio;
    const text = phonetic.text;
    phoneticsHeader.innerHTML += `<td> ${text ?? ""} ${
      audio
        ? `<span class="phoneticAudio">&nbsp;&nbsp;&#128264;<audio controls style="display:none;" src="${audio}"></audio></span>`
        : ""
    } </td>`;
  });
  phoneticsRow.appendChild(phoneticsHeader);
  tableBody.appendChild(phoneticsRow);

  document.querySelectorAll(".phoneticAudio").forEach(function (element) {
    element.addEventListener("click", function () {
      const audioElement = element.querySelector("audio");
      if (audioElement) {
        audioElement.play();
      }
    });
  });
};

const addMeanings = (meanings) => {
  console.log("Meanings", meanings);

  meanings.forEach((meaning) => {
    const partOfSpeech = meaning.partOfSpeech;
    const definitions = meaning.definitions;

    definitions.forEach((definition) => {
      const card = document.createElement("div");
      card.classList.add("card", "mb-2", "text-justify");

      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");

      if (partOfSpeech !== "null" && partOfSpeech !== undefined) {
        addKeyValuePair(cardBody, "PartOfSpeech", partOfSpeech);
      }

      if (
        definition.definition !== "null" &&
        definition.definition !== undefined
      ) {
        addKeyValuePair(cardBody, "Definition", definition.definition);
      }

      if (definition.example !== "null" && definition.example !== undefined) {
        addKeyValuePair(cardBody, "Example", definition.example);
      }

      if (
        definition.synonyms !== null &&
        definition.synonyms !== undefined &&
        definition.synonyms.length > 0
      ) {
        addKeyValuePair(cardBody, "Synonyms", definition.synonyms.join(", "));
      }

      if (
        definition.antonyms !== null &&
        definition.antonyms !== undefined &&
        definition.antonyms.length > 0
      ) {
        addKeyValuePair(cardBody, "Antonyms", definition.antonyms.join(", "));
      }

      card.appendChild(cardBody);
      tableBody.appendChild(card);
    });
  });
};

const addKeyValuePair = (parent, key, value) => {
  if (!value) {
    return; // Skip if there's no value
  }

  const row = document.createElement("div");
  row.classList.add("row", "mb-1", "p-1"); // Reduced padding

  const keyColumn = document.createElement("div");
  keyColumn.classList.add("col-md-3", "font-weight-bold", "p-0"); // No horizontal padding
  keyColumn.textContent = key + ":";

  const valueColumn = document.createElement("div");
  valueColumn.classList.add("col-md", "p-0"); // No horizontal padding
  valueColumn.textContent = value;

  row.appendChild(keyColumn);
  row.appendChild(valueColumn);

  // Add styling only if there's a value
  row.style.border = "1px solid rgba(0, 0, 0, 0.1)"; // semi-transparent border
  row.style.borderRadius = "5px"; // rounded corners
  row.style.background = "rgba(255, 255, 255, 0.1)"; // semi-transparent background

  parent.appendChild(row);
};

function renderJSON(wordObject) {
  console.log(wordObject);
  tableBody.innerHTML = "";
  tableHeader.innerHTML = wordObject.word;

  addPhonetics(wordObject.phonetic, wordObject.phonetics);
  addMeanings(wordObject.meanings);
}

getRandomWord().then((word) => {
  console.log("random word is:", word);
  renderJSON(word);
});
