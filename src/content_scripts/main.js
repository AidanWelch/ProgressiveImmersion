import {
	DEFAULT_MIN_WORD_LENGTH,
	browser
} from '../config';
import countWord from './analyze';
import translate from './translate';

function capitalizationPermutations ( stringArray ){
	const result = [];
	for ( const s of stringArray ) {
		result.push( s.toUpperCase() );
		result.push( s.toLowerCase() );
	}

	return result;
}

const TAGS_TO_TRANSLATE = capitalizationPermutations( [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'th', 'td', 'a', 'i', 'em', 'strong', 'mark', 'ul', 'main' ] );
const TAGS_TO_TRANSLATE_WHEN_NESTED_IN_TRACKED_TAGS = capitalizationPermutations( [ 'div', 'span' ] ); // thanks tagName for being inconsistent!

let dictionary = undefined;
let origin = undefined;
let target = undefined;
let minWordLength = DEFAULT_MIN_WORD_LENGTH;

function checkAncestorInTags ( node, tags ) {
	if ( !Array.isArray( tags ) ) {
		tags = [ tags ];
	}

	if ( node.parentNode && tags.includes( node.parentNode.tagName ) ) {
		return true;
	}

	return node.parentNode !== null ? checkAncestorInTags( node.parentNode, tags ) : false;
}

function checkShouldTranslateNode ( node ) {
	return TAGS_TO_TRANSLATE.includes( node.tagName ) || (
		TAGS_TO_TRANSLATE_WHEN_NESTED_IN_TRACKED_TAGS.includes( node.tagName ) &&
		checkAncestorInTags( node, TAGS_TO_TRANSLATE )
	);
}

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

	// this method of element selection is currently leading to a lot double(or more) tallying of words
	// but it is at least in some form needed for dynamically rendered sites(like gmail)
	// the double counting doesn't seem to be harming word selection for now but if it gets bad
	// then probably the solution will be just analyzing text nodes
	const mutationObserver = new MutationObserver( function ( mutationRecords ) {
		for ( const mutation of mutationRecords ) {
			if ( ( mutation.type === 'characterData' || mutation.type === 'attributes' ) && mutation.target.innerText && checkShouldTranslateNode( mutation.target ) ) {
				viewObserver.observe( mutation.target ); // make sure it is being observed
				return;
			}

			if ( !mutation.addedNodes ) {
				return;
			}

			for ( const addedNode of mutation.addedNodes ) {
				( function observeNodesAndChildren ( node ){
					if (
						checkShouldTranslateNode( node )
					) {
						if ( node.innerText ) {
							viewObserver.observe( node );
						}

						mutationObserver.observe( node, { characterData: true, attributes: true });
					}

					for ( const child of node.childNodes ) {
						observeNodesAndChildren( child );
					}
				})( addedNode );
			}
		}
	});

	mutationObserver.observe( document.body, {
		subtree: true,
		childList: true
	});

	if ( value.state && !isExcluded ){
		dictionary = value.dictionary;
		origin = value.origin;
		target = value.target;
		minWordLength = value.minWordLength ?? minWordLength;

		const elems = document.body.querySelectorAll( TAGS_TO_TRANSLATE.join( ',' ) );
		for ( const elem of elems ){
			// elem.style.backgroundColor = "#0A0A0A" // For debugging
			if ( elem.innerText ){
				viewObserver.observe( elem );
			}

			mutationObserver.observe( elem, { characterData: true, attributes: true });
		}

		const nestedElems = document.body.querySelectorAll( TAGS_TO_TRANSLATE_WHEN_NESTED_IN_TRACKED_TAGS.join( ',' ) );
		for ( const nestedElem of nestedElems ) {
			if ( checkAncestorInTags( nestedElem, TAGS_TO_TRANSLATE ) ){
				// nestedElem.style.backgroundColor = "#A00000" // For debugging
				if ( nestedElem.innerText ) {
					viewObserver.observe( nestedElem );
				}

				mutationObserver.observe( nestedElem, { characterData: true, attributes: true });
			}
		}
	}
});

const matchLetter = /\p{L}/u;
const viewObserver = new IntersectionObserver( ( entries ) => {
	entries.forEach( entry => {
		/* entry.target.style.backgroundColor = "#AA0000"; // For debugging
		if ( entry.isIntersecting && entry.target.analyzed) {
			entry.target.style.backgroundColor = "#00AA00";
		} */

		if ( entry.isIntersecting && !entry.target.analyzed ){
			// entry.target.style.backgroundColor = "#0000AA"; // For debugging
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