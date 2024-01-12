import translate from 'google-translate-api-x';

const MAX_TRANSLATE_ATTEMPTS = 3;

async function translateWord ( word, origin, target ) {
	for ( let attempts = 0; attempts < MAX_TRANSLATE_ATTEMPTS; attempts++ ) {
		try {
			const res = await translate( word, { from: origin, to: target, forceBatch: false });
			return res.text.toLowerCase();
		} catch ( _ ) { null; }
	}

	throw 'Never successfully translated!';
}

export default translateWord;