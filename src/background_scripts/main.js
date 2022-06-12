import { browser } from "../config";
import updateDictionary from "./dictionary-handler";

browser.storage.local.get(["state", "latestWordTime", "updateFrequency", "origin", "originNativeName", "target", "targetNativeName"]).then( value => {
	if(value.state === undefined){
		value.state = false;
		browser.storage.local.set({ state: false });
	}

	if (value.origin === undefined || value.originNativeName === undefined) {
		browser.storage.local.set({ origin: "en", originNativeName: "English" });
	}

	if (value.target === undefined || value.targetNativeName === undefined) {
		browser.storage.local.set({ target: "es", targetNativeName: "Spanish" })
	}

	if (value.latestWordTime === undefined) {
		value.latestWordTime = Date.now();
		browser.storage.local.set({ latestWordTime: value.latestWordTime });
	}

	if(value.state){
		browser.browserAction.setBadgeText({text: "On"});
		browser.browserAction.setBadgeBackgroundColor({color: "green"});
		awaitNextWord(value);
	} else {
		browser.browserAction.setBadgeText({text: "Off"});
		browser.browserAction.setBadgeBackgroundColor({color: "red"});
	}
});

browser.storage.onChanged.addListener( (changes, areaName) => {
	if (areaName === "local") {
		if (changes.updateFrequency || (changes.state && changes.state.newValue === true)) {
			browser.storage.local.get(["state", "latestWordTime", "updateFrequency"]).then( value => {
				if (value.state === true) {
					awaitNextWord(value);
				}
			});
		} else if (changes.state && changes.state.newValue === false) {
			browser.alarms.clearAll();
		}
	}
});

function awaitNextWord (value) {
	browser.alarms.clearAll();
	const nextWordDelay = (value.latestWordTime - Date.now())  + ((value.updateFrequency !== undefined ? value.updateFrequency : 12) * 60 * 60 * 1000);
	browser.alarms.create({ when: nextWordDelay });
}

browser.alarms.onAlarm.addListener(() => {
	browser.storage.local.get(["updateFrequency", "latestWordTime"]).then( value => {
		updateDictionary();
		browser.storage.local.set({ latestWordTime: Date.now() });
		awaitNextWord(value)
	})
});