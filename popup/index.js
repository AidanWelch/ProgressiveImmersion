//ON/OFF
browser.browserAction.setBadgeBackgroundColor({color: "white"});
var state;
browser.storage.local.get("state").then((value) => {
    state = value.state;
    document.getElementById("onSwitch").checked = state;
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


//Update Slider

browser.storage.local.get("updateFrequency").then((value) => {
    document.getElementById("updateSlider").value = (value.updateFrequency) ? value.updateFrequency : 12.0;
    document.getElementById("updateSliderText").innerHTML = `New words every ${value.updateFrequency} hours`;
});

document.getElementById("updateSlider").oninput = () => {
    var updateFrequency = parseFloat(document.getElementById("updateSlider").value);
    document.getElementById("updateSliderText").innerHTML = `New words every ${updateFrequency.toPrecision(3)} hours`;
    browser.storage.local.set({updateFrequency: updateFrequency});
};


//Language Selection

browser.storage.local.get("originNativeName").then((value) => {
    document.getElementById("originButton").innerHTML = value.originNativeName;
});

browser.storage.local.get("targetNativeName").then((value) => {
    document.getElementById("targetButton").innerHTML = value.targetNativeName;
});


// Exclusion List

browser.storage.local.get("exclusionListMode").then((value) => {
    if (value.exclusionListMode === "whitelist"){
        document.getElementById("whitelistCheck").checked = true;
    } else {
        document.getElementById("blacklistCheck").checked = true;
    }
});

browser.storage.local.get("exclusionList").then((value) => {
    if (value.exclusionList){
        document.getElementById("exclusionList").value = value.exclusionList;
    }
});

document.getElementById("exclusionListMode").oninput = () => {
    if(document.getElementById("whitelistCheck").checked) {
        browser.storage.local.set({exclusionListMode: "whitelist"});
    } else {
        browser.storage.local.set({exclusionListMode: "blacklist"});
    }
};

document.getElementById("exclusionList").addEventListener("input", () => {
    console.log(document.getElementById("exclusionList").value)
    browser.storage.local.set({exclusionList: document.getElementById("exclusionList").value});
});