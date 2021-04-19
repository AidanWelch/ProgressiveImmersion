browser.storage.local.get("state").then((value) => {
    var state = value.state;
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
});