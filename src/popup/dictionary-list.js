import {
	LANGUAGES,
	browser
} from '../config';

const dictionaryList = document.getElementById( 'dictionaryList' );

browser.storage.local.get( [ 'dictionary', 'target', 'origin' ] ).then( value => {
	if ( value.dictionary === undefined ) {
		value.dictionary = {};
	}

	if ( value.dictionary[value.origin] === undefined ) {
		value.dictionary[value.origin] = {};
	}

	if ( value.dictionary[value.origin][value.target] === undefined ) {
		value.dictionary[value.origin][value.target] = {};
	}

	for ( const origin in value.dictionary ) {
		for ( const target in value.dictionary[origin] ) {
			const listItem = document.createElement( 'li' );
			const button = document.createElement( 'a' );
			button.classList.add( 'w3-button' );
			button.textContent = LANGUAGES[origin] + ' -> ' + LANGUAGES[target];
			button.href = 'dictionary.html#' + origin + '~' + target + '~' + LANGUAGES[origin] + '~' + LANGUAGES[target];
			listItem.appendChild( button );
			dictionaryList.appendChild( listItem );
		}
	}

	const importFileElem = document.getElementById( 'import-file' );
	importFileElem.addEventListener( 'change', e => {
		if ( e.target.files.length === 0 ) {
			return;
		}

		e.target.files[0].text().then( text => {
			console.log( text );
		});
	});

/* TODO
	document.getElementById( 'import-button' ).addEventListener( 'click', e => {
		importFileElem.click();
	});
*/
});