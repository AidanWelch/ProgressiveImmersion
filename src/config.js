import browser from "webextension-polyfill";
if (!browser.action) {
	browser.action = browser.browserAction;
}
const LANGUAGES = require("google-translate-api-x/languages");
const DEFAULT_UPDATE_FREQUENCY = 12;
const DEFAULT_MIN_WORD_LENGTH = 4;
const DEFAULT_WORDS_TO_SAVE = 5;
const DEFAULT_FILTER_MAX_SHARE_OF_WORDS = 0.0075;
const DEFAULT_FILTER_MIN_SHARE_OF_WORDS = 0.001

export {
	browser,
	LANGUAGES,
	DEFAULT_UPDATE_FREQUENCY,
	DEFAULT_MIN_WORD_LENGTH,
	DEFAULT_WORDS_TO_SAVE,
	DEFAULT_FILTER_MAX_SHARE_OF_WORDS,
	DEFAULT_FILTER_MIN_SHARE_OF_WORDS
};