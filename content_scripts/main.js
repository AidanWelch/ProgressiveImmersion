browser.storage.local.get("state").then((value) => {
    if(value.state){
        var matchTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "th", "td", "span"];       
        matchTags.forEach((tag) => {
            var elems = document.body.getElementsByTagName(tag);
            for(var i = 0; i < elems.length; i++){
                if(elems.item(i).textContent){
                    observer.observe(elems.item(i));
                }
            }
        });
    }
});

var observer = new IntersectionObserver((entries) =>{
    entries.forEach(entry => {
        if(entry.isIntersecting && !entry.target.analyzed){
            entry.target.analyzed = true;
            var words = entry.target.textContent.match(/[\p{L}-]+/ug);
            if(words){
                for(var word of words){
                    if(word.length > 2){
                        
                    }
                }
            }
        }
    })
});