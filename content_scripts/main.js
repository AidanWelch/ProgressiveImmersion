var progressiveImmersion = {};
browser.storage.local.get("state").then((value) => {
    if(value.state){
        var matchTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "th", "td", "span", "a"];       
        matchTags.forEach((tag) => {
            var elems = document.body.getElementsByTagName(tag);
            for(var i = 0; i < elems.length; i++){
                if(elems.item(i).textContent){
                    progressiveImmersion.trackElement(elems.item(i));
                    //progressiveImmersion.translate(elems.item(i));
                }
            }
        });
    }
});