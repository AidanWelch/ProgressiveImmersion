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
		const row = document.createElement("li");
		row.classList.add("w3-row");
	
		const text = document.createElement("p");
		text.classList.add("w3-col", "s9", "w3-center");
		text.textContent = original + " -> " + translated;
		row.appendChild(text);
	
		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.classList.add("w3-button", "s3", "w3-center", "w3-col", "w3-red");
		deleteButton.addEventListener("click", e => {
			delete value.dictionary[originIso][targetIso][original];
			browser.storage.local.set({dictionary: value.dictionary});
			row.remove();
		});
		row.appendChild(deleteButton);
	
		dictionary.appendChild(row)
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