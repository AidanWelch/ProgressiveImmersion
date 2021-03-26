var state;
browser.browserAction.setBadgeBackgroundColor({color: "white"});

browser.storage.local.get("state").then((value) => {
    state = value.state;
    document.getElementById("on-switch").checked = state;
});

function updateBadgeState(){
    if(state){
        browser.browserAction.setBadgeText({text: "On"});
        browser.browserAction.setBadgeTextColor({color: "green"});
    } else {
        browser.browserAction.setBadgeText({text: "Off"});
        browser.browserAction.setBadgeTextColor({color: "red"});
    }
}

document.getElementById("on-switch").addEventListener("click", () => {
    state = document.getElementById("on-switch").checked;
    updateBadgeState();
    browser.storage.local.set({state: state});
});