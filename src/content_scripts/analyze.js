let wordsToSave = DEFAULT_WORDS_TO_SAVE;
let filterMaxShareOfWords = DEFAULT_FILTER_MAX_SHARE_OF_WORDS;
let filterMinShareOfWords = DEFAULT_FILTER_MIN_SHARE_OF_WORDS;

browser.storage.local.get(["filterMaxShareOfWords", "filterMinShareOfWords", "wordsToSave"]).then( value => {
	filterMaxShareOfWords = value.filterMaxShareOfWords !== undefined ? value.filterMaxShareOfWords : filterMaxShareOfWords;
	filterMinShareOfWords = value.filterMinShareOfWords !== undefined ? value.filterMinShareOfWords : filterMinShareOfWords;
	wordsToSave = value.wordsToSave !== undefined ? value.wordsToSave : wordsToSave;
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