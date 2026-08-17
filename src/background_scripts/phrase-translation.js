import { browser } from '../config';
import translate from 'google-translate-api-x';

const MAX_PHRASE_TRANSLATIONS_PER_DAY = 50;
const PHRASE_TRANSLATION_DELAY = 1500;
const phraseTranslationsPromise = browser.storage.local.get( 'phraseTranslations' )
	.then( value => value.phraseTranslations ?? {});
let translationQueue = Promise.resolve( 0 );

async function translatePhrase ( phrase, origin, target ) {
	const phraseTranslations = await phraseTranslationsPromise;

	const phraseLower = phrase.toLowerCase().replace( /\s+/gu, ' ' );

	const storedTranslation = phraseTranslations.translations?.[origin]?.[target]?.[phraseLower];
	if ( storedTranslation !== undefined ) {
		return storedTranslation;
	}

	let translationResult = undefined;

	const queuedTranslation = translationQueue.catch( () => Date.now() ).then( async lastTranslationTime => {
		const latestStoredTranslation = phraseTranslations.translations?.[origin]?.[target]?.[phraseLower];

		if ( latestStoredTranslation !== undefined ) {
			translationResult = latestStoredTranslation;
			return lastTranslationTime;
		}

		const today = new Date().toISOString()
			.slice( 0, 10 );
		if ( phraseTranslations.date !== today ) {
			phraseTranslations.date = today;
			phraseTranslations.requestCount = 0;
		}

		if ( phraseTranslations.requestCount >= MAX_PHRASE_TRANSLATIONS_PER_DAY ) {
			return lastTranslationTime;
		}

		phraseTranslations.requestCount = ( phraseTranslations.requestCount ?? 0 ) + 1;
		await browser.storage.local.set({ phraseTranslations });
		await new Promise( resolve => setTimeout(
			resolve,
			( lastTranslationTime + PHRASE_TRANSLATION_DELAY ) - Date.now()
		) );

		const requestTime = Date.now();
		const response = await translate( phraseLower, {
			from: origin,
			to: target,
			forceBatch: false
		});
		translationResult = response.text.toLowerCase();

		phraseTranslations.translations ??= {};
		phraseTranslations.translations[origin] ??= {};
		phraseTranslations.translations[origin][target] ??= {};
		phraseTranslations.translations[origin][target][phraseLower] = translationResult;
		await browser.storage.local.set({ phraseTranslations });

		return requestTime;
	});

	translationQueue = queuedTranslation;

	await queuedTranslation;
	return translationResult;
}

export default translatePhrase;