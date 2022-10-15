import {	
	browser,
	LANGUAGES
} from "../config";

document.getElementById("title").innerHTML = 
	(window.location.hash === "#origin") ? "Source Language" : "Target Language";

const languageList = document.getElementById("languageList");

for (let isoCode in LANGUAGES) {
	if (typeof LANGUAGES[isoCode] === "function") {
		continue;
	}
	if (window.location.hash.slice(1) === "target" && isoCode === "auto") {
		continue;
	}
	const listItem = document.createElement("li");
	const button = document.createElement("button");
	button.classList.add("w3-button");
	button.innerHTML = LANGUAGES[isoCode];
	button.isoCode = isoCode;
	button.nativeName = LANGUAGES[isoCode];
	button.addEventListener("click", (e) => {
		browser.storage.local.set({[window.location.hash.slice(1)]: e.target.isoCode});
		browser.storage.local.set({[window.location.hash.slice(1) + "NativeName"]: e.target.nativeName});
		window.location.href = "./index.html";
	});
	listItem.appendChild(button);
	languageList.appendChild(listItem);
}