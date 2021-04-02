var state;
var updateFrequency = 12.0;
browser.browserAction.setBadgeBackgroundColor({color: "white"});

browser.storage.local.get("state").then((value) => {
    state = value.state;
    document.getElementById("onSwitch").checked = state;
});

browser.storage.local.get("originNativeName").then((value) => {
    document.getElementById("originButton").innerHTML = value.originNativeName;
});

browser.storage.local.get("targetNativeName").then((value) => {
    document.getElementById("targetButton").innerHTML = value.targetNativeName;
});

browser.storage.local.get("exclusionListMode").then((value) => {
    if (value.exclusionListMode === "whitelist"){
        document.getElementById(whitelistCheck).checked = true;
    } else {
        document.getElementById(blacklistCheck).checked = true;
    }
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

document.getElementById("onSwitch").addEventListener("click", () => {
    state = document.getElementById("onSwitch").checked;
    updateBadgeState();
    browser.storage.local.set({state: state});
});

document.getElementById("updateSlider").oninput = () => {
    updateFrequency = parseFloat(document.getElementById("updateSlider").value);
    document.getElementById("updateSliderText").innerHTML = `New words every ${updateFrequency.toPrecision(3)} hours`;
};