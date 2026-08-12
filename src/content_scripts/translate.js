import { browser } from '../config';

/* class ProgressiveImmersionWord extends HTMLElement {
	constructor () {
		super();
	}

	connectedCallback () {
		this.innerHTML = this.getAttribute( 'data-translated-word' ) ?? '';
		this.addEventListener( 'mouseover', e => {
			e.target.innerHTML = e.target.getAttribute( 'data-original-word' ) ?? '';
		});
		this.addEventListener( 'mouseout', e => {
			e.target.innerHTML = e.target.getAttribute( 'data-translated-word' ) ?? '';
		});
	}
}

customElements.define( 'progressive-immersion-word', ProgressiveImmersionWord ); */

// Weirdly in some cases(like wikipedia) where the site uses the `.nodeType` property
// it throws a permission error with the custom element.


function translate ( wordLower, matchedArray, textNode, intersectionTarget, dictionaryPage ) {
	// `Object.prototype.hasOwnProperty.call` ensures there is no conflict if
	// a property of a parent of the dictionary page(for example in `.__proto__`)
	// has the same name as wordLower- like what would cause issues with the `in`
	// keyword.  Calling from the prototype prevents the error (that should be
	// impossible) of `.hasOwnProperty` being overwritten(should be impossible
	// because it wouldn't preserve through lowercase) but it is better to be safe
	if ( !Object.prototype.hasOwnProperty.call( dictionaryPage, wordLower ) ) {
		return;
	}

	const { 0: originalWord, index: wordIndex } = matchedArray;

	let translated = dictionaryPage[wordLower];
	if ( wordLower.toUpperCase() === originalWord ) {
		translated = translated.toUpperCase();
	} else if ( wordLower !== originalWord ) {
		translated = translated.charAt( 0 ).toUpperCase() + translated.slice( 1 );
	}

	const wordElement = document.createElement( 'progressive-immersion-word' );
	wordElement.setAttribute( 'data-original-word', originalWord );
	wordElement.setAttribute( 'data-translated-word', translated );

	wordElement.innerHTML = translated;
	wordElement.style.borderBottom = '1px dotted currentColor';
	wordElement.addEventListener( 'mouseover', e => {
		e.target.innerHTML = e.target.getAttribute( 'data-original-word' ) ?? '';
	});
	wordElement.addEventListener( 'mouseout', e => {
		e.target.innerHTML = e.target.getAttribute( 'data-translated-word' ) ?? '';
	});

	const otherTextHalf = textNode.splitText( wordIndex );
	otherTextHalf.textContent = otherTextHalf.textContent.slice( originalWord.length );

	intersectionTarget.insertBefore( wordElement, otherTextHalf );
}

function translatePhrase ( matchedWords, textNode, intersectionTarget, dictionaryPage, origin, target ) {
	const firstWord = matchedWords[0];
	const lastWord = matchedWords[matchedWords.length - 1];
	const phraseEnd = lastWord.index + lastWord[0].length;
	const originalPhrase = textNode.textContent.slice( firstWord.index, phraseEnd );
	let translatedPhrase = originalPhrase;

	for ( let i = matchedWords.length - 1; i >= 0; i-- ) {
		const matchedWord = matchedWords[i];
		const originalWord = matchedWord[0];
		const wordLower = originalWord.toLowerCase();
		const relativeIndex = matchedWord.index - firstWord.index;
		let translatedWord = dictionaryPage[wordLower];

		if ( wordLower.toUpperCase() === originalWord ) {
			translatedWord = translatedWord.toUpperCase();
		} else if ( wordLower !== originalWord ) {
			translatedWord = translatedWord.charAt( 0 ).toUpperCase() + translatedWord.slice( 1 );
		}

		translatedPhrase = translatedPhrase.slice( 0, relativeIndex ) +
			translatedWord + translatedPhrase.slice( relativeIndex + originalWord.length );
	}

	const phraseElement = document.createElement( 'progressive-immersion-word' );
	phraseElement.setAttribute( 'data-original-word', originalPhrase );
	phraseElement.setAttribute( 'data-translated-word', translatedPhrase );
	phraseElement.textContent = translatedPhrase;
	phraseElement.style.borderBottom = '1px dotted currentColor';

	let showingOriginal = false;
	phraseElement.addEventListener( 'mouseover', e => {
		showingOriginal = true;
		e.target.textContent = e.target.getAttribute( 'data-original-word' ) ?? '';
	});
	phraseElement.addEventListener( 'mouseout', e => {
		showingOriginal = false;
		e.target.textContent = e.target.getAttribute( 'data-translated-word' ) ?? '';
	});

	const otherTextHalf = textNode.splitText( firstWord.index );
	otherTextHalf.textContent = otherTextHalf.textContent.slice( originalPhrase.length );
	intersectionTarget.insertBefore( phraseElement, otherTextHalf );

	browser.runtime.sendMessage({
		phrase: originalPhrase,
		origin,
		target,
		type: 'translate-phrase'
	}).then( translation => {
		if ( translation === undefined ) {
			return;
		}

		if ( originalPhrase.toUpperCase() === originalPhrase ) {
			translation = translation.toUpperCase();
		} else if ( originalPhrase.toLowerCase() !== originalPhrase ) {
			translation = translation.charAt( 0 ).toUpperCase() + translation.slice( 1 );
		}

		phraseElement.setAttribute( 'data-translated-word', translation );
		if ( !showingOriginal ) {
			phraseElement.textContent = translation;
		}
	})
		.catch( () => null );
}

export { translatePhrase };
export default translate;