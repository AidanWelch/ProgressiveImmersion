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


function translate ( wordLower, matchedArray, textNode, intersectionTarget, dictionary, origin, target ) {
	if ( dictionary?.[origin]?.[target] === undefined ) {
		return;
	}

	const dictionaryPage = dictionary[origin][target];
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

export default translate;