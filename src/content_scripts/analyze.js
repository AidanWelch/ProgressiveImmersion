progressiveImmersion.trackElement = function (elem){
	progressiveImmersion.viewObserver.observe(elem);
}

const minWordLength = 4;  /// TODO change to stored setting

progressiveImmersion.viewObserver = new IntersectionObserver((entries) =>{
	entries.forEach(entry => {
		if(entry.isIntersecting && !entry.target.analyzed){
			entry.target.analyzed = true;
			var words = entry.target.textContent.match(/[\p{L}-]+/ug);
			if(words){
				for(var word of words){
					if(word.length >= minWordLength){
						progressiveImmersion.countWord(word.toLowerCase());
					}
				}
			}
		}
	})
});

progressiveImmersion.wordTally = new Map();
progressiveImmersion.countWord = function (word){
	if(!progressiveImmersion.wordTally.has(word)){
		progressiveImmersion.wordTally.set(word, 0);
	}
	progressiveImmersion.wordTally.set(word, progressiveImmersion.wordTally.get(word) + 1);
}

window.onbeforeunload = (e) => {
	browser.storage.local.get(["state", "wordQueue"]).then((value) => {
		if(value.state){
			progressiveImmersion.analyzeWordTally(value);
		}
	});
}

const filterMaxShareOfWords = 0.0075;  /// TODO change to stored setting
const filterMinShareOfWords = 0.001;  /// TODO change to stored setting
const wordsToSave = 5;  /// TODO change to stored setting

progressiveImmersion.analyzeWordTally = function(value){
	if (value.wordQueue === undefined) {
		value.wordQueue = [];
	}

	const time = Date.now();

	for (let i = 0; i < value.wordQueue.length; i++){
		const instances = progressiveImmersion.wordTally.get(value.wordQueue[i][0]);
		if (instances !== undefined){
			value.wordQueue[i][1] += instances;
			value.wordQueue[i][2] = time;
			progressiveImmersion.wordTally.delete(value.wordQueue[i][0]);
		}
	}

	let tallyArray = [...progressiveImmersion.wordTally].sort((a, b) => b[1] - a[1]);
	let totalWords = 0;
	for(var i = 0; i < tallyArray.length; ++i){
		totalWords += tallyArray[i][1];
	}
	tallyArray = tallyArray.filter((a) => ((a[1]/totalWords) <= filterMaxShareOfWords) && ((a[1]/totalWords) >= filterMinShareOfWords));
	tallyArray = tallyArray.slice(0, wordsToSave);
	for (let i = 0; i < tallyArray.length; i++){
		if (value.wordQueue.length < 100) {
			tallyArray[i].push(time);
			value.wordQueue.push(tallyArray[i]);
		}
	}
	browser.storage.local.set({ wordQueue: value.wordQueue });
}