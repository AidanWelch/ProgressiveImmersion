import browser from "webextension-polyfill";
import 'setimmediate'
import translate from '@vitalets/google-translate-api'

(async function () {
	const res = await translate('Ik spreek Engels', {to: 'en'});
	console.log(res.text);
})();

function updateDictionary(){
	browser.storage.local.get([ "wordpack", "wordpackIndex", "wordQueue"])
}

export default updateDictionary