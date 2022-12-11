function translate (elem, dictionary, origin, target) {

	if (dictionary?.[origin]?.[target] === undefined) {
		return;
	}

	const dictionaryPage = dictionary[origin][target];
	
	const regex = new RegExp('(?<!<[^<>]*)\\b(' +
		Object.keys(dictionaryPage).join('|')
		+ ')\\b(?![^<>]*>)', "gui");
	
	elem.innerHTML = elem.innerHTML.replaceAll(regex, (match) => {
		const word = match.toLowerCase();
		return `<progressive-immersion-word data_original="${match}" data_translated="${dictionaryPage[word]}">${dictionaryPage[word]}</progressive-immersion-word>`;
	});

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