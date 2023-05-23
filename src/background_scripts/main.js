import { browser } from '../config';
import updateDictionary from './dictionary-handler';

browser.storage.local.get( [ 'state', 'latestWordTime', 'updateFrequency', 'origin', 'originNativeName', 'target', 'targetNativeName' ] ).then( value => {
	if ( value.state === undefined ){
		value.state = false;
		browser.storage.local.set({ state: false });
	}

	if ( value.origin === undefined || value.originNativeName === undefined ) {
		browser.storage.local.set({ origin: 'en', originNativeName: 'English' });
	}

	if ( value.target === undefined || value.targetNativeName === undefined ) {
		browser.storage.local.set({ target: 'es', targetNativeName: 'Spanish' });
	}

	if ( value.latestWordTime === undefined ) {
		value.latestWordTime = Date.now();
		browser.storage.local.set({ latestWordTime: value.latestWordTime });
	}

	if ( value.state ){
		browser.action.setBadgeText({ text: 'On' });
		browser.action.setBadgeBackgroundColor({ color: 'green' });
		awaitNextWord( value );
	} else {
		browser.action.setBadgeText({ text: 'Off' });
		browser.action.setBadgeBackgroundColor({ color: 'red' });
	}
});

browser.storage.onChanged.addListener( ( changes, areaName ) => {
	if ( areaName === 'local' ) {
		if ( changes.updateFrequency || changes.state ) {
			browser.storage.local.get( [ 'state', 'latestWordTime', 'updateFrequency' ] ).then( value => {
				browser.alarms.clearAll();
				if ( value.state === true ) {
					awaitNextWord( value );
				}
			});
		}
	}
});

function awaitNextWord ( value ) {
	const nextWordTime = value.latestWordTime + ( ( value.updateFrequency !== undefined ? value.updateFrequency : 12 ) * 60 * 60 * 1000 );
	browser.alarms.create({ when: nextWordTime });
}

browser.alarms.onAlarm.addListener( () => {
	browser.storage.local.get( [ 'updateFrequency' ] ).then( value => {
		value.latestWordTime = Date.now();
		updateDictionary();
		browser.storage.local.set({ latestWordTime: value.latestWordTime });
		awaitNextWord( value );
	});
});