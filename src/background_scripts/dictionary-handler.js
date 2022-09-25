import { browser } from "../config";
import translate from 'google-translate-api-x'

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

		let word = value.wordQueue.sort((a, b) => a[1] - b[1]).pop();

		while (value.dictionary[value.origin][value.target][word[0]] !== undefined) {
			word = value.wordQueue.pop();
			if (word === undefined) {
				browser.storage.local.set({wordQueue: value.wordQueue});
				return;
			}
		}

		browser.cookies.getAll({domain: ".google.com"}).then( cookies => {
			const promises = [];
			for (let cookie of cookies) {
				promises.push(browser.cookies.remove({url: "https://" + cookie.domain + cookie.path, name: cookie.name}).then( res => {return (res !== null) ? cookie : false} ));
			}
			return Promise.all(promises);
		}).then( (cookies) => {
			return translate(word[0], {from: value.origin, to: value.target}).then( res => {
				value.dictionary[value.origin][value.target][word[0]] = res.text;
				browser.storage.local.set({
					dictionary: value.dictionary,
					wordQueue: value.wordQueue
				});
			}).then( () => {
				for (let cookie of cookies) {
					if (cookie) {
						const new_cookie = {
							//domain: cookie.domain,
							expirationDate: cookie.expirationDate,
							httpOnly: cookie.httpOnly,
							name: cookie.name,
							path: cookie.path,
							sameSite: cookie.sameSite,
							secure: cookie.secure,
							//storeId: cookie.storeId,
							url: "https://" + cookie.domain + cookie.path,
							value: cookie.value
						}
						browser.cookies.set(new_cookie);
					}
				}
			});
		});

	});
}

export default updateDictionary