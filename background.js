chrome.browserAction.onClicked.addListener(function(tabs) {
	chrome.tabs.create({
		url: 'index.html'
	});
});