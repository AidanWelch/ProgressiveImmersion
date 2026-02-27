import { NEVER_UPDATE_FREQUENCY, browser } from '../config';
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

	updateContextMenu( value.originNativeName ?? 'English', value.targetNativeName ?? 'Spanish' );

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

		if ( changes.originNativeName || changes.targetNativeName ) {
			browser.storage.local.get( [ 'originNativeName', 'targetNativeName' ] ).then( value => {
				updateContextMenu( value.originNativeName, value.targetNativeName );
			});
		}
	}
});

function awaitNextWord ( value ) {
	const freq = value.updateFrequency !== undefined ? value.updateFrequency : 12;
	if ( freq >= NEVER_UPDATE_FREQUENCY ) {
		return;
	}

	const nextWordTime = value.latestWordTime + ( freq * 60 * 60 * 1000 );
	browser.alarms.create({ when: nextWordTime });
}

function updateContextMenu ( originName, targetName ) {
	browser.contextMenus.removeAll().then( () => {
		browser.contextMenus.create({
			id: 'translate-add-word-to-dictionary',
			title: `Translate and Add to ${originName} -> ${targetName} dictionary`,
			contexts: [ 'selection' ]
		});
	});
}

browser.contextMenus.onClicked.addListener( ( info, tab ) => {
	if ( info.menuItemId !== 'translate-add-word-to-dictionary' || !info.selectionText ) {
		return;
	}

	browser.storage.local.get( [ 'origin', 'target', 'originNativeName', 'targetNativeName' ] ).then( value => {
		const word = encodeURIComponent( info.selectionText.trim() );

		const autoTranslate = '&autoTranslate=true';

		const urlFragment = `#${value.origin}~${value.target}~${value.originNativeName}~${value.targetNativeName}`;

		browser.windows.create({
			url: `popup/dictionary.html?word=${word}${autoTranslate}${urlFragment}`,
			type: 'popup',
			width: 500,
			height: 600
		});
	});
});

browser.alarms.onAlarm.addListener( () => {
	browser.storage.local.get( [ 'updateFrequency' ] ).then( value => {
		value.latestWordTime = Date.now();
		updateDictionary();
		browser.storage.local.set({ latestWordTime: value.latestWordTime });
		awaitNextWord( value );
	});
});