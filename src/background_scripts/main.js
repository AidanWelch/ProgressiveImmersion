import browser from "webextension-polyfill";
import "./analyze-handler"
import updateDictionary from "./dictionary-handler";

browser.storage.local.get(["state", "latestWordTime", "updateFrequency"]).then( value => {
	if(value.state === undefined){
		value.state = false;
		browser.storage.local.set({ state: false });
	}
	browser.browserAction.setBadgeBackgroundColor({color: "white"});
	if(value.state){
		browser.browserAction.setBadgeText({text: "On"});
		browser.browserAction.setBadgeTextColor({color: "green"});
		awaitNextWord(value);
	} else {
		browser.browserAction.setBadgeText({text: "Off"});
		browser.browserAction.setBadgeTextColor({color: "red"});
	}

	if (value.latestWordTime === undefined) {
		value.latestWordTime = Date.now();
		browser.storage.local.set({ latestWordTime: value.latestWordTime });
	}

	browser.storage.onChanged.addListener( (changes, areaName) => {
		if (areaName === "local") {
			if (changes.updateFrequency || (changes.state && changes.state.newValue === true)) {
				browser.storage.local.get(["state", "latestWordTime", "updateFrequency"]).then( value => {
					if (value.state === true) {
						awaitNextWord(value);
					}
				});
			} else if (changes.state && changes.state.newValue === false) {
				clearTimeout(timeoutID);
			}
		}
	});
});

let timeoutID;
function awaitNextWord (value) {
	clearTimeout(timeoutID)
	const nextWordDelay = (value.latestWordTime - Date.now())  + ((value.updateFrequency ? value.updateFrequency : 12) * 60 * 60 * 1000);
	timeoutID = setTimeout(handleNextWord, nextWordDelay);
}

function handleNextWord(){
	browser.storage.local.get(["updateFrequency", "latestWordTime"]).then( value => {
		// TODO update dictionary
		browser.storage.local.set({ latestWordTime: Date.now() });
		awaitNextWord(value)
	})
}