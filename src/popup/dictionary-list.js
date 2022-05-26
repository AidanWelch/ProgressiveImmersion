const dictionaryList = document.getElementById("dictionaryList");

const languages = LANGUAGES;

browser.storage.local.get(["dictionary", "target", "origin"]).then( value => {
	if (value.dictionary === undefined) {
		value.dictionary = {};
	}

	if (value.dictionary[value.origin] === undefined) {
		value.dictionary[value.origin] = {};
	}

	if (value.dictionary[value.origin][value.target] === undefined) {
		value.dictionary[value.origin][value.target] = {};
	}
	
	for (const origin in value.dictionary) {
		for (const target in value.dictionary[origin]) {
			const listItem = document.createElement("li");
			const button = document.createElement("a");
			button.classList.add("w3-button");
			button.textContent = languages[origin] + " -> " + languages[target];
			button.href = "dictionary.html#" + origin + "~" + target + "~" + languages[origin] + "~" + languages[target];
			listItem.appendChild(button);
			dictionaryList.appendChild(listItem);
		}
	}

});