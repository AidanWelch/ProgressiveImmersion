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

var filterMaxShareOfWords = 15;  ///TODO change to stored setting, and percentage of total word occurences
var filterMinShareOfWords = 1;  ///TODO change to stored setting, and percentage of total word occurences
var wordsToSave = 5;  ///TODO change to stored setting

progressiveImmersion.analyzeWordTally = function(){
    var tallyArray = [...progressiveImmersion.wordTally].sort((a, b) => b[1] - a[1]);
    tallyArray = tallyArray.filter((a) => a[1] <= filterMaxShareOfWords && a[1] >= filterMinShareOfWords);
    tallyArray = tallyArray.slice(0, wordsToSave);
    console.log(tallyArray);
}