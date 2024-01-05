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

const TAGS_TO_TRANSLATE = capitalizationPermutations( [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'th', 'td', 'a', 'i', 'em', 'strong', 'mark', 'ul', 'main', 'yt-formatted-string', 'yt-attributed-string' ] );
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

	if ( !value.state || isExcluded ){
		return;
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
});

const viewObserver = new IntersectionObserver( ( entries ) => {
	// could use the `d` regex flag but I think it is actually less clear than just
	// using the match length
	// the regex in this scope to preven the same regex being called by multiple
	// insersections causing the `.lastIndex` being written to simulatenously
	const matchWords = /(?<=^|[\P{L}])(?<![0-9])\p{L}+(?![0-9])(?=$|\P{L})/gu;
	// first it checks if the word is preceded by a non-letter or the start
	// next it checks that its not preceded by a number
	// next it checks for 1 or more unicode letters
	// next it checks that its not followed by a number
	// last it checks that it is followed by the end of the string or non-letters
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
			while ( ( matchedArray = matchWords.exec( node.textContent ) ) !== null ) {
				const [ word ] = matchedArray;

				const wordLower = word.toLowerCase();
				if ( word.length >= minWordLength ) {
					countWord( wordLower );
				}

				translate( wordLower, matchedArray, node, entry.target, dictionary, origin, target );
			}
		}
	}
});