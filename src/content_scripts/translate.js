function translate (elem, dictionary, origin, target) {

	if (origin === undefined || target === undefined || dictionary === undefined || dictionary[origin] === undefined || dictionary[origin][target] === undefined) {
		return;
	}

	const dictionaryPage = dictionary[origin][target];
	
	for (let word in dictionaryPage) {
		const regex = new RegExp(`(?<!<[^<>]*)\\b${word}\\b(?![^<>]*>)`, "gui");
		const injection = `<progressive-immersion-word data_original="${word}" data_translated="${dictionaryPage[word]}">${dictionaryPage[word]}</progressive-immersion-word>`
		elem.innerHTML = elem.innerHTML.replaceAll(regex, injection);
	}

	const wordElements = elem.getElementsByTagName("progressive-immersion-word");
	for (let word of wordElements) {
		word.addEventListener("mouseover", e => {
			e.target.textContent = e.target.getAttribute("data_original");
		});
		word.addEventListener("mouseout", e => {
			e.target.textContent = e.target.getAttribute("data_translated");
		});
	}

}

export default translate;