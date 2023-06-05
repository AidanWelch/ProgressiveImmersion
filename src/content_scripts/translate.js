function translate ( wordLower, originalWord, dictionary, origin, target ) {
	if ( dictionary?.[origin]?.[target] === undefined ) {
		return originalWord;
	}

	const dictionaryPage = dictionary[origin][target];
	if ( Object.prototype.hasOwnProperty.call( dictionaryPage, wordLower ) ) {
		let translated = dictionaryPage[wordLower];
		if ( wordLower !== originalWord ) {
			translated = translated.charAt( 0 ).toUpperCase() + translated.slice( 1 );
		}

		return `<progressive-immersion-word data_original="${originalWord}" data_translated="${translated}">${translated}</progressive-immersion-word>`;
	}

	return originalWord;
}

export default translate;