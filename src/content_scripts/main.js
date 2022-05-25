const progressiveImmersion = {};

let dictionary = undefined;
let origin = undefined;
let target = undefined;
let minWordLength = DEFAULT_MIN_WORD_LENGTH;

browser.storage.local.get(["state", "dictionary", "origin", "target", "minWordLength"]).then( value => {
	if(value.state){
		dictionary = value.dictionary;
		origin = value.origin;
		target = value.target;
		minWordLength = value.minWordLength !== undefined ? value.minWordLength : minWordLength;
		const matchTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "th", "td", "span", "a"];       
		matchTags.forEach((tag) => {
			const elems = document.body.getElementsByTagName(tag);
			for(var i = 0; i < elems.length; i++){
				if(elems.item(i).textContent){
					progressiveImmersion.trackElement(elems.item(i));
				}
			}
		});
	}
});

progressiveImmersion.viewObserver = new IntersectionObserver((entries) =>{
	entries.forEach(entry => {
		if(entry.isIntersecting && !entry.target.analyzed){
			entry.target.analyzed = true;
			var words = entry.target.innerText.match(/[\p{L}-]+/ug);
			if(words){
				for(var word of words){
					if(word.length >= minWordLength){
						progressiveImmersion.countWord(word.toLowerCase());
					}
				}
			}
			progressiveImmersion.translate(entry.target, dictionary, origin, target);
		}
	})
});