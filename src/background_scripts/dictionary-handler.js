import { browser } from '../config';
import translateWord from '../translateWord';

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

		try {
			value.dictionary[value.origin][value.target][word[0]] = await translateWord( word[0], value.origin, value.target );
			browser.storage.local.set({
				dictionary: value.dictionary,
				wordQueue: value.wordQueue
			});
		} catch ( _ ) { null; }
	});
}

export default updateDictionary;