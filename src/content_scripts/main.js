import {
	DEFAULT_MIN_WORD_LENGTH,
	browser
} from '../config';
import countWord from './analyze';
import translate from './translate';

let dictionary = undefined;
let origin = undefined;
let target = undefined;
let minWordLength = DEFAULT_MIN_WORD_LENGTH;

browser.storage.local.get( [ 'state', 'dictionary', 'origin', 'target', 'minWordLength', 'exclusionList', 'exclusionListMode' ] ).then( value => {
	let isExcluded = false;

	value.exclusionListMode = value.exclusionListMode ?? 'blacklist';

	if ( value.exclusionList !== undefined ) {
		isExcluded = value.exclusionList.some( exclusion => {
			if ( exclusion === '' ) {
				return false;
			}

			return value.exclusionListMode === 'blacklist' ? window.location.href.includes( exclusion ) : !window.location.href.includes( exclusion );
		});
	}

	if ( value.state && !isExcluded ){
		dictionary = value.dictionary;
		origin = value.origin;
		target = value.target;
		minWordLength = value.minWordLength ?? minWordLength;
		const matchTags = [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'th', 'td', 'a' ];
		matchTags.forEach( ( tag ) => {
			const elems = document.body.getElementsByTagName( tag );
			for ( let i = 0; i < elems.length; i++ ){
				if ( elems.item( i ).textContent ){
					viewObserver.observe( elems.item( i ) );
				}
			}
		});
	}
});

const matchLetter = /\p{L}/u;
const viewObserver = new IntersectionObserver( ( entries ) => {
	entries.forEach( entry => {
		if ( entry.isIntersecting && !entry.target.analyzed ){
			entry.target.analyzed = true;
			const innerHTML = entry.target.innerHTML;
			let result = '';
			let inTag = false;
			let inTagString = false;
			let inWord = false;
			// let inUrl = false; // to prevent for example https://freedwave.com/test/ from matching "freedwave", "com", or "test" TODO - also avoid filepaths
			let inEscapedSymbol = false;
			let wordStart = 0;
			for ( let i = 0; i < innerHTML.length; i++ ) {
				if ( inTag ) {
					if ( innerHTML[i] === '"' ) {
						inTagString = !inTagString;
					} else if ( innerHTML[i] === '>' && !inTagString ) {
						inTag = false;
					}

					result += innerHTML[i];
					continue;
				}

				if ( matchLetter.test( innerHTML[i] ) & !inEscapedSymbol ) {
					if ( !inWord ) {
						inWord = true;
						wordStart = i;
					}

					continue;
				} else if ( inWord ) {
					const word = innerHTML.slice( wordStart, i );
					const wordLower = word.toLowerCase();
					if ( word.length >= minWordLength ) {
						countWord( wordLower );
					}

					result += translate( wordLower, word, dictionary, origin, target );
					inWord = false;
				} else {
					inEscapedSymbol = false;
				}

				if ( innerHTML[i] === '<' ) {
					inTag = true;
				}

				if ( innerHTML[i] === '&' ) {
					inEscapedSymbol = true;
				}

				result += innerHTML[i];
			}

			if ( inWord ) {
				const word = innerHTML.slice( wordStart, innerHTML.length );
				const wordLower = word.toLowerCase();
				if ( word.length >= minWordLength ) {
					countWord( wordLower );
				}

				result += translate( wordLower, word, dictionary, origin, target );
			}

			entry.target.innerHTML = result;

			const wordElements = entry.target.getElementsByTagName( 'progressive-immersion-word' );
			for ( const word of wordElements ) {
				word.addEventListener( 'mouseover', e => {
					e.target.textContent = e.target.getAttribute( 'data_original' );
				});
				word.addEventListener( 'mouseout', e => {
					e.target.textContent = e.target.getAttribute( 'data_translated' );
				});
			}
		}
	});
});