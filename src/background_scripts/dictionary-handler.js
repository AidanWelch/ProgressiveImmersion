import browser from "webextension-polyfill";
import 'setimmediate'
import translate from '@vitalets/google-translate-api'

function updateDictionary(){
	browser.storage.local.get([ "wordpack", "wordpackIndex", "wordQueue", "origin", "target", "dictionary"]).then( value => {
		
		if (value.origin === undefined || value.target === undefined || value.wordQueue === undefined || value.wordQueue.length === 0) {
			return;
		}

		if (value.dictionary === undefined) {
			value.dictionary = {};
		}
		if (value.dictionary[value.origin] === undefined) {
			value.dictionary[value.origin] = {};
		}
		if (value.dictionary[value.origin][value.target] === undefined) {
			value.dictionary[value.origin][value.target] = {};
		}

		const word = value.wordQueue.sort((a, b) => a[1] - b[1]).pop();

		if (value.dictionary[value.origin][value.target][word] !== undefined) {
			return;
		}

		translate(word[0], {from: value.origin, to: value.target}).then( res => {
			value.dictionary[value.origin][value.target][word[0]] = res.text;
			browser.storage.local.set({
				dictionary: value.dictionary,
				wordQueue: value.wordQueue
			});
		});

	});
}

export default updateDictionary