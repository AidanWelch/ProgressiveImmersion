import { browser } from '../config';
import translate from 'google-translate-api-x';

const MAX_PHRASE_TRANSLATIONS_PER_DAY = 50;
const PHRASE_TRANSLATION_DELAY = 1500;
const phraseTranslationsPromise = browser.storage.local.get( 'phraseTranslations' )
	.then( value => value.phraseTranslations ?? {});
let translationQueue = Promise.resolve();

function translatePhrase ( phrase, origin, target ) {
	const phraseLower = phrase.toLowerCase().replace( /\s+/gu, ' ' );
	return phraseTranslationsPromise.then( phraseTranslations => {
		const storedTranslation = phraseTranslations.translations?.[origin]?.[target]?.[phraseLower];

		if ( storedTranslation !== undefined ) {
			return storedTranslation;
		}

		translationQueue = translationQueue.catch( () => null ).then( async () => {
			const latestStoredTranslation = phraseTranslations.translations?.[origin]?.[target]?.[phraseLower];

			if ( latestStoredTranslation !== undefined ) {
				return latestStoredTranslation;
			}

			const today = new Date().toISOString()
				.slice( 0, 10 );
			if ( phraseTranslations.date !== today ) {
				phraseTranslations.date = today;
				phraseTranslations.requestCount = 0;
			}

			if ( phraseTranslations.requestCount >= MAX_PHRASE_TRANSLATIONS_PER_DAY ) {
				return undefined;
			}

			phraseTranslations.requestCount = ( phraseTranslations.requestCount ?? 0 ) + 1;
			await browser.storage.local.set({ phraseTranslations });
			await new Promise( resolve => setTimeout( resolve, PHRASE_TRANSLATION_DELAY ) );

			const response = await translate( phraseLower, {
				from: origin,
				to: target,
				forceBatch: false
			});
			const translated = response.text.toLowerCase();

			phraseTranslations.translations ??= {};
			phraseTranslations.translations[origin] ??= {};
			phraseTranslations.translations[origin][target] ??= {};
			phraseTranslations.translations[origin][target][phraseLower] = translated;
			await browser.storage.local.set({ phraseTranslations });

			return translated;
		});

		return translationQueue;
	});
}

export default translatePhrase;