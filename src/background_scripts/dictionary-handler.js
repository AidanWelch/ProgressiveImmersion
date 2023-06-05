import { browser } from '../config';
import translate from 'google-translate-api-x';

const MAX_TRANSLATE_ATTEMPTS = 3;

function updateDictionary (){
	browser.storage.local.get( [ 'wordpack', 'wordpackIndex', 'wordQueue', 'origin', 'target', 'dictionary' ] ).then( async value => {
		if ( value.origin === undefined || value.target === undefined || value.wordQueue === undefined || value.wordQueue.length === 0 ) {
			return;
		}

		if ( value.dictionary === undefined ) {
			value.dictionary = {};
		}

		if ( value.dictionary[value.origin] === undefined ) {
			value.dictionary[value.origin] = {};
		}

		if ( value.dictionary[value.origin][value.target] === undefined ) {
			value.dictionary[value.origin][value.target] = {};
		}

		let word = value.wordQueue.sort( ( a, b ) => a[1] - b[1] ).pop();

		while ( value.dictionary[value.origin][value.target][word[0]] !== undefined ) {
			word = value.wordQueue.pop();
			if ( word === undefined ) {
				browser.storage.local.set({ wordQueue: value.wordQueue });
				return;
			}
		}

		let attempts = 0;
		let passed = false;
		while ( attempts < MAX_TRANSLATE_ATTEMPTS && !passed ) {
			await translate( word[0], { from: value.origin, to: value.target, forceBatch: false })
				.then( res => {
					value.dictionary[value.origin][value.target][word[0]] = res.text;
					browser.storage.local.set({
						dictionary: value.dictionary,
						wordQueue: value.wordQueue
					});
					passed = true;
				})
				.catch( () => {
					attempts++;
				});
		}
	});
}

export default updateDictionary;