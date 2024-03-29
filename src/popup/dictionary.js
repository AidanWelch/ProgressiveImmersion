import { browser } from '../config';
import translateWord from '../translateWord';

const dictionary = document.getElementById( 'dictionary' );
const [ originIso, targetIso, originName, targetName ] = window.location.hash.slice( 1 ).split( '~' );

document.getElementById( 'source-title' ).textContent = originName;
document.getElementById( 'target-title' ).textContent = targetName;

browser.storage.local.get( 'dictionary' ).then( value => {
	if ( value.dictionary === undefined ) {
		value.dictionary = {};
	}

	if ( value.dictionary[originIso] === undefined ) {
		value.dictionary[originIso] = {};
	}

	if ( value.dictionary[originIso][targetIso] === undefined ) {
		value.dictionary[originIso][targetIso] = {};
	}

	for ( const word in value.dictionary[originIso][targetIso] ) {
		drawTranslation( word, value.dictionary[originIso][targetIso][word] );
	}

	const sourceWordInput = document.getElementById( 'source-word' );
	const translatedWordInput = document.getElementById( 'translated-word' );
	document.getElementById( 'submit-word' ).addEventListener( 'click', async e => {
		if ( sourceWordInput.value === '' ) {
			return;
		}

		const sourceWord = sourceWordInput.value.toLowerCase();
		if ( translatedWordInput.value === '' ) {
			try {
				translatedWordInput.value = await translateWord( sourceWord, originIso, targetIso );
			} catch ( _ ) {
				return;
			}
		}

		value.dictionary[originIso][targetIso][sourceWord] = translatedWordInput.value.toLowerCase();
		browser.storage.local.set({ dictionary: value.dictionary });
		drawTranslation( sourceWord, translatedWordInput.value.toLowerCase() );
		sourceWordInput.value = '';
		translatedWordInput.value = '';
	});

	document.addEventListener( 'keypress', ( e ) => {
		if ( e.key === 'Enter' ) {
			e.preventDefault();
			document.getElementById( 'submit-word' ).click();
		}
	});

	function drawTranslation ( original, translated ) {
		const row = dictionary.insertRow( dictionary.rows.length - 1 );

		const [ originalElem, targetElem ] = [ document.createElement( 'td' ), document.createElement( 'td' ) ];
		[ originalElem.textContent, targetElem.textContent ] = [ original, translated ];
		row.appendChild( originalElem );
		row.appendChild( targetElem );

		const deleteButtonHeader = document.createElement( 'th' );
		const deleteButton = document.createElement( 'button' );
		deleteButton.textContent = 'Delete';
		deleteButton.classList.add( 'w3-button', 'w3-red' );
		deleteButton.addEventListener( 'click', e => {
			delete value.dictionary[originIso][targetIso][original];
			browser.storage.local.set({ dictionary: value.dictionary });
			row.remove();
		});
		deleteButtonHeader.appendChild( deleteButton );
		row.appendChild( deleteButtonHeader );
	}

	if ( Object.keys( value.dictionary[originIso][targetIso] ).length === 0 ) {
		const caption = dictionary.createCaption();
		caption.classList.add( 'w3-blue', 'w3-card' );
		caption.textContent = 'Your dictionary is currently empty, try using the extension more.  Or, you can add words manually below.';
	}

/* TODO
	document.getElementById( 'export-button' ).addEventListener( 'click', e => {
		if ( Object.keys( value.dictionary[originIso][targetIso] ).length === 0 ) {
			return;
		}

		const downloadData = {};
		downloadData[originIso] = {};
		downloadData[originIso][targetIso] = value.dictionary[originIso][targetIso];
		const blob = new Blob( [ JSON.stringify( downloadData ) ], { type: 'application/json' });
		browser.downloads.download({
			filename: originIso + '-to-' + targetIso + '.json',
			saveAs: true,
			url: URL.createObjectURL( blob, { oneTimeOnly: true })
		});
	});
*/
});