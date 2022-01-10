browser.storage.local.get(["state", "latestWordTime"]).then((value) => {
    let state = value.state;
    if(state === undefined){
        state = false;
        browser.storage.local.set({state: state});
    }
    browser.browserAction.setBadgeBackgroundColor({color: "white"});
    if(state){
        browser.browserAction.setBadgeText({text: "On"});
        browser.browserAction.setBadgeTextColor({color: "green"});
    } else {
        browser.browserAction.setBadgeText({text: "Off"});
        browser.browserAction.setBadgeTextColor({color: "red"});
    }
    awaitNextWord((value.latestWordTime) ? value.latestWordTime : 0);
});

function awaitNextWord(latestWordTime){
    let time = Date.now();
    browser.storage.local.get("updateFrequency").then((value) => {
        if (time >= latestWordTime + ((value.updateFrequency) ? value.updateFrequency : 0)){
            //do dictionary updating here
            browser.storage.local.set({latestWordTime: time});
            latestWordTime = time;
        }
    })
    setTimeout(awaitNextWord(latestWordTime), time + 1800000) // A 30 minute increment
}