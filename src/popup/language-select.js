document.getElementById("title").innerHTML = 
	(window.location.hash === "#origin") ? "Source Language" : "Target Language";

const languageList = document.getElementById("languageList");

const xhr = new XMLHttpRequest();

xhr.open("GET", "https://ssl.gstatic.com/inputtools/js/ln/17/en.js", true);
xhr.onreadystatechange = () => {
	if(xhr.readyState === 4){
		let nativeNames = xhr.responseText.slice(30);
		nativeNames = nativeNames.slice(nativeNames.indexOf("{"), nativeNames.indexOf("}") + 1);
		nativeNames = nativeNames.replaceAll("'", '"')
		nativeNames = JSON.parse(nativeNames);
		for (let isoCode in nativeNames) {
			const listItem = document.createElement("li");
			const button = document.createElement("button");
			button.classList.add("w3-button");
			button.innerHTML = nativeNames[isoCode];
			button.isoCode = isoCode;
			button.nativeName = nativeNames[isoCode];
			button.addEventListener("click", (e) => {
				browser.storage.local.set({[window.location.hash.slice(1)]: e.target.isoCode});
				browser.storage.local.set({[window.location.hash.slice(1) + "NativeName"]: e.target.nativeName});
				window.location.href = "./index.html";
			});
			listItem.appendChild(button);
			languageList.appendChild(listItem);
		}
	}
};
xhr.send();