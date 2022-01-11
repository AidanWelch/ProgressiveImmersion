progressiveImmersion.trackElement = function (elem){
    progressiveImmersion.viewObserver.observe(elem);
}

var minWordLength = 3;  ///TODO change to stored setting

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

window.onbeforeunload = () => {
    browser.storage.local.get("state").then((value) => {
        if(value.state){
            progressiveImmersion.analyzeWordTally();
        }
    });
}

var filterMaxShareOfWords = 0.0075;  ///TODO change to stored setting
var filterMinShareOfWords = 0.001;  ///TODO change to stored setting
var wordsToSave = 5;  ///TODO change to stored setting

progressiveImmersion.analyzeWordTally = function(){
    browser.storage.local.get("wordQueue").then((value) => {
        if (value.wordQueue === undefined) {
            value.wordQueue = [];
        }

        for (let i = 0; i < value.wordQueue.length; i++){
            let instances = progressiveImmersion.wordTally.get(value.wordQueue[i][0]);
            if (instances !== undefined){
                value.wordQueue[i][1] += instances;
                progressiveImmersion.wordQueue.delete(value.wordQueue[i][0]);
            }
        }

        var tallyArray = [...progressiveImmersion.wordTally].sort((a, b) => b[1] - a[1]);
        var totalWords = 0;
        for(var i = 0; i < tallyArray.length; ++i){
            totalWords += tallyArray[i][1];
        }
        for(var i = 0; i < tallyArray.length; ++i){
            tallyArray[i][3] = tallyArray[i][1]/totalWords;
        }
        tallyArray = tallyArray.filter((a) => ((a[1]/totalWords) <= filterMaxShareOfWords) && ((a[1]/totalWords) >= filterMinShareOfWords));
        tallyArray = tallyArray.slice(0, wordsToSave);
    });
}