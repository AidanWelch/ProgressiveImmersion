import {
	DEFAULT_MIN_WORD_LENGTH,
	DEFAULT_PHRASE_TRANSLATION_ENABLED,
	browser
} from '../config';
import { translate, translatePhrase } from './translate';
import countWord from './analyze';

const MAX_PHRASE_WORDS = 5;

document.addEventListener( 'copy', ( event ) => {
	const selection = window.getSelection();

	if ( selection.rangeCount === 0 ) {
		return;
	}

	const range = selection.getRangeAt( 0 );

	const fragment = range.cloneContents();

	const translatedElements = fragment.querySelectorAll( 'progressive-immersion-word' );

	if ( translatedElements.length === 0 ) {
		return;
	}

	event.preventDefault();

	translatedElements.forEach( elem => {
		const originalWord = elem.getAttribute( 'data-original-word' );
		if ( originalWord ) {
			const textNode = document.createTextNode( originalWord );
			elem.replaceWith( textNode );
		}
	});

	const tempDiv = document.createElement( 'div' );
	tempDiv.appendChild( fragment );

	if ( event.clipboardData ) {
		event.clipboardData.setData( 'text/plain', tempDiv.textContent );
		event.clipboardData.setData( 'text/html', tempDiv.innerHTML );
	}
});

function capitalizationPermutations ( stringArray ){
	const result = [];
	for ( const s of stringArray ) {
		result.push( s.toUpperCase() );
		result.push( s.toLowerCase() );
	}

	return result;
}

const TAGS_TO_TRANSLATE = capitalizationPermutations( [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'th', 'td', 'a', 'i', 'em', 'strong', 'mark', 'ul', 'main', 'yt-formatted-string', 'yt-attributed-string' ] );
const TAGS_TO_TRANSLATE_WHEN_NESTED_IN_TRACKED_TAGS = capitalizationPermutations( [ 'div', 'span' ] ); // thanks tagName for being inconsistent!

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

browser.storage.local.get( [ 'state', 'dictionary', 'origin', 'target', 'minWordLength', 'exclusionList', 'exclusionListMode', 'phraseTranslationEnabled' ] ).then( value => {
	value.exclusionListMode = value.exclusionListMode ?? 'blacklist';
	let enabledForThisPage = true;

	if ( value.exclusionList === undefined ) {
		enabledForThisPage = value.exclusionListMode === 'blacklist';
	} else {
		const inList = value.exclusionList.some( exclusion => {
			if ( exclusion === '' ) {
				return false;
			}

			return window.location.href.includes( exclusion );
		});

		enabledForThisPage = value.exclusionListMode === 'whitelist' ? inList : !inList;
	}

	if ( !enabledForThisPage || !value.state ){
		return;
	}

	const dictionary = value.dictionary;
	const origin = value.origin;
	const target = value.target;
	const minWordLength = value.minWordLength ?? DEFAULT_MIN_WORD_LENGTH;
	const phraseTranslationEnabled = value.phraseTranslationEnabled ??
		DEFAULT_PHRASE_TRANSLATION_ENABLED;

	const viewObserver = new IntersectionObserver( ( entries ) => {
		const dictionaryPage = dictionary?.[origin]?.[target] === undefined ?
			{} : dictionary[origin][target];

		const wordsInDictionary = Object.keys( dictionaryPage )
			.sort( ( a, b ) => b.length - a.length )
			.map( w => RegExp.escape( w ) );

		// could use the `d` regex flag but I think it is actually less clear than just
		// using the match length
		// the regex in this scope to preven the same regex being called by multiple
		// insersections causing the `.lastIndex` being written to simulatenously
		const matchWords = new RegExp(
			'(?<=^|[\\P{L}])(?<![0-9])(' +
			// first it checks if the word is preceded by a non-letter or the start
			// next it checks that its not preceded by a number
				( wordsInDictionary.length === 0 ? '' : (
					'(?<dictionaryWord>' + wordsInDictionary.join( '|' ) + ')|'
				) )+
				// construct a group matching all words in the dictionary
				'(\\p{L}+(?:[\'’]\\p{L}+)*)'+
			// next it checks for 1 or more unicode letters
			')(?![0-9])(?=$|\\P{L})',
			// next it checks that its not followed by a number
			// last it checks that it is followed by the end of the string or non-letters
			'gui'
		);
		for ( const entry of entries ) {
			/* entry.target.style.backgroundColor = "#AA0000"; // For debugging
			if ( entry.isIntersecting && entry.target.progressiveImmersionAnalyzed) {
				entry.target.style.backgroundColor = "#00AA00";
			} */

			if ( !entry.isIntersecting || entry.target.progressiveImmersionAnalyzed ) {
				continue;
			}

			entry.target.progressiveImmersionAnalyzed = true;
			// entry.target.style.backgroundColor = "#0000AA"; // For debugging

			for ( const node of entry.target.childNodes ){
				if ( node.nodeType !== Node.TEXT_NODE ) {
					continue;
				}

				matchWords.lastIndex = 0;
				let matchedArray;
				const phrases = [];
				while ( ( matchedArray = matchWords.exec( node.textContent ) ) !== null ) {
					const [ word ] = matchedArray;
					const wordLower = word.toLowerCase();

					if ( matchedArray?.groups?.dictionaryWord !== undefined ) {
						if ( phraseTranslationEnabled ) {
							const previousPhrase = phrases[phrases.length - 1];
							const previousWord = previousPhrase?.[previousPhrase.length - 1];
							const previousWordEnd = previousWord === undefined ? 0 :
								previousWord.index + previousWord[0].length;
							const separator = node.textContent.slice( previousWordEnd, matchedArray.index );

							if (
								previousPhrase !== undefined &&
								previousPhrase.length < MAX_PHRASE_WORDS &&
								/^[^\S\r\n\u2028\u2029]+$/u.test( separator )
							) {
								previousPhrase.push( matchedArray );
							} else {
								phrases.push( [ matchedArray ] );
							}
						} else {
							translate( wordLower, matchedArray, node, entry.target, dictionaryPage );
						}

						continue;
					}

					if ( word.length >= minWordLength ) {
						countWord( wordLower );
					}
				}

				for ( let i = phrases.length - 1; i >= 0; i-- ) {
					if ( phrases[i].length === 1 ) {
						const [ word ] = phrases[i];
						translate( word[0].toLowerCase(), word, node, entry.target, dictionaryPage );
					} else {
						translatePhrase( phrases[i], node, entry.target, dictionaryPage, origin, target );
					}
				}
			}
		}
	});

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

					if ( node.nodeType !== Node.ELEMENT_NODE ) {
						return;
					}

					for ( const child of node.children ) {
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
});