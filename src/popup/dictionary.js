import { browser } from "../config";

const dictionary = document.getElementById("dictionary");
const [originIso, targetIso, originName, targetName] = window.location.hash.slice(1).split("~");

document.getElementById("title").textContent = originName + " -> " + targetName;

browser.storage.local.get("dictionary").then( value => {
	if (value.dictionary === undefined) {
		value.dictionary = {};
	}

	if (value.dictionary[originIso] === undefined) {
		value.dictionary[originIso] = {};
	}

	if (value.dictionary[originIso][targetIso] === undefined) {
		value.dictionary[originIso][targetIso] = {};
	}

	for (const word in value.dictionary[originIso][targetIso]) {
		drawTranslation( word, value.dictionary[originIso][targetIso][word] );
	}

	const sourceWordInput = document.getElementById("source-word");
	const translatedWordInput = document.getElementById("translated-word");
	document.getElementById("submit-word").addEventListener("click", e => {
		if (sourceWordInput.value !== "" && translatedWordInput.value !== "") {
			value.dictionary[originIso][targetIso][sourceWordInput.value.toLowerCase()] = translatedWordInput.value.toLowerCase();
			browser.storage.local.set({dictionary: value.dictionary});
			drawTranslation( sourceWordInput.value.toLowerCase(), translatedWordInput.value.toLowerCase() );
			sourceWordInput.value = "";
			translatedWordInput.value = "";
		}
	});

	function drawTranslation (original, translated) {
		const row = dictionary.insertRow(dictionary.rows.length - 1);
	
		const [originalElem, targetElem] = [document.createElement("td"), document.createElement("td")];
		[originalElem.textContent, targetElem.textContent] = [original, translated];
		row.appendChild(originalElem);
		row.appendChild(targetElem);
	
		const deleteButtonHeader = document.createElement("th");
		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.classList.add("w3-button", "w3-red");
		deleteButton.addEventListener("click", e => {
			delete value.dictionary[originIso][targetIso][original];
			browser.storage.local.set({dictionary: value.dictionary});
			row.remove();
		});
		deleteButtonHeader.appendChild(deleteButton)
		row.appendChild(deleteButtonHeader);
	}

	if (Object.keys(value.dictionary[originIso][targetIso]).length === 0) {
		const listItem = document.createElement("li");
		const text = document.createElement("p");
		text.textContent = "Your dictionary is currently empty, try using the extension more.  Or, you can add a word manually below.";
		listItem.appendChild(text);
		dictionary.appendChild(listItem);
		return;
	}
});