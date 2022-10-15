import {	
	browser,
	DEFAULT_UPDATE_FREQUENCY,
} from "../config";

// ON/OFF

let state;
browser.storage.local.get("state").then((value) => {
	state = value.state;
	if(state === undefined){
		state = false;
		browser.storage.local.set({state: state});
	}
	document.getElementById("onSwitch").checked = state;
	updateBadgeState();
});

function updateBadgeState(){
	if(state){
		browser.action.setBadgeText({text: "On"});
		browser.action.setBadgeBackgroundColor({color: "green"});
	} else {
		browser.action.setBadgeText({text: "Off"});
		browser.action.setBadgeBackgroundColor({color: "red"});
	}
}

document.getElementById("onSwitch").addEventListener("click", () => {
	state = document.getElementById("onSwitch").checked;
	updateBadgeState();
	browser.storage.local.set({state: state});
});


// Update Slider

browser.storage.local.get("updateFrequency").then((value) => {
	document.getElementById("updateSlider").value = (value.updateFrequency !== undefined) ? value.updateFrequency : DEFAULT_UPDATE_FREQUENCY;
	document.getElementById("updateSliderText").innerHTML = `New words every ${document.getElementById("updateSlider").value} hours`;
	if (value.updateFrequency === undefined) {
		browser.storage.local.set({updateFrequency: DEFAULT_UPDATE_FREQUENCY})
	}
});

document.getElementById("updateSlider").oninput = () => {
	const updateFrequency = parseFloat(document.getElementById("updateSlider").value);
	document.getElementById("updateSliderText").innerHTML = `New words every ${updateFrequency.toPrecision(3)} hours`;
	browser.storage.local.set({updateFrequency: updateFrequency});
};


// Language Selection

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
		document.getElementById("exclusionList").value = value.exclusionList.join("\n");
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
	browser.storage.local.set({exclusionList: document.getElementById("exclusionList").value.trim().split("\n")});
});