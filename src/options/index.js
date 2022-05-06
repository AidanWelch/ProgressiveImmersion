// Precise Update Frequency Options
browser.storage.local.get("updateFrequency").then((value) => {
	document.getElementById("updateFrequency").value = (value.updateFrequency !== undefined) ? value.updateFrequency : DEFAULT_UPDATE_FREQUENCY;
	if (value.updateFrequency === undefined) {
		browser.storage.local.set( {updateFrequency: DEFAULT_UPDATE_FREQUENCY} )
	}
});

document.getElementById("updateFrequency").oninput = () => {
	const updateFrequency = parseFloat(document.getElementById("updateFrequency").value);
	browser.storage.local.set({ updateFrequency: updateFrequency });
};

// Min Word Length Option
browser.storage.local.get("minWordLength").then((value) => {
	document.getElementById("minWordLength").value = (value.minWordLength !== undefined) ? value.minWordLength : DEFAULT_MIN_WORD_LENGTH;
	if (value.minWordLength === undefined) {
		browser.storage.local.set( {minWordLength: DEFAULT_MIN_WORD_LENGTH} )
	}
});

document.getElementById("minWordLength").oninput = () => {
	const minWordLength = parseFloat(document.getElementById("minWordLength").value);
	browser.storage.local.set({ minWordLength: minWordLength });
};

// Words to Save Option
browser.storage.local.get("wordsToSave").then((value) => {
	document.getElementById("wordsToSave").value = (value.wordsToSave !== undefined) ? value.wordsToSave : DEFAULT_WORDS_TO_SAVE;
	if (value.wordsToSave === undefined) {
		browser.storage.local.set({ wordsToSave: DEFAULT_WORDS_TO_SAVE })
	}
});

document.getElementById("wordsToSave").oninput = () => {
	const wordsToSave = parseFloat(document.getElementById("wordsToSave").value);
	browser.storage.local.set({ wordsToSave: wordsToSave });
};

// Filter Max Share of Words Option
browser.storage.local.get("filterMaxShareOfWords").then((value) => {
	document.getElementById("filterMaxShareOfWords").value = (value.filterMaxShareOfWords !== undefined) ? value.filterMaxShareOfWords : DEFAULT_FILTER_MAX_SHARE_OF_WORDS;
	if (value.filterMaxShareOfWords === undefined) {
		browser.storage.local.set({ filterMaxShareOfWords: DEFAULT_FILTER_MAX_SHARE_OF_WORDS })
	}
});

document.getElementById("filterMaxShareOfWords").oninput = () => {
	const filterMaxShareOfWords = parseFloat(document.getElementById("filterMaxShareOfWords").value);
	browser.storage.local.set({ filterMaxShareOfWords: filterMaxShareOfWords });
};

// Filter Min Share of Words Option
browser.storage.local.get("filterMinShareOfWords").then((value) => {
	document.getElementById("filterMinShareOfWords").value = (value.filterMinShareOfWords !== undefined) ? value.filterMinShareOfWords : DEFAULT_FILTER_MIN_SHARE_OF_WORDS;
	if (value.filterMinShareOfWords === undefined) {
		browser.storage.local.set({ filterMinShareOfWords: DEFAULT_FILTER_MIN_SHARE_OF_WORDS })
	}
});

document.getElementById("filterMinShareOfWords").oninput = () => {
	const filterMinShareOfWords = parseFloat(document.getElementById("filterMinShareOfWords").value);
	browser.storage.local.set({ filterMinShareOfWords: filterMinShareOfWords });
};