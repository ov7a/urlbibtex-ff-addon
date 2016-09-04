var clipboard = require("sdk/clipboard");
var contextMenu = require("sdk/context-menu");
var langs = require("./langs");

function zero_pad(n) {
    return String("00" + n).slice(-2);
};

function format(name, title, url, date, lang){
return	`@online{${name},
	title = {${title}},
	url = {${url}},
	urldate = {${date}},
	language = {${lang}}
}`;
};

function extractDomain(url) {
	var domain;
	if (url.indexOf("://") > -1) {
		domain = url.split('/')[2];
	} else {
		domain = url.split('/')[0];
	}
	domain = domain.split(':')[0];
	return domain;
};

function domainToId(domain){
	var parts = domain.split('.');
	if (parts[0] == 'www'){
		parts = parts.slice(1);
	}
	if (parts.length > 1){
		parts = parts.slice(0, -1);
	}	
	return parts.join('_');
};

var menuItem = contextMenu.Item({
	label: "Get BibTex Entry",
	context: contextMenu.PageContext(),
	contentScript: 'self.on("click", function (node, data) {' +
	               'var msg = new Object();' + //FFS this is so stupid
	               'msg.url = document.URL;' + 
	               'msg.title = document.title;' + 
	               'msg.lang = document.documentElement.lang;' + 
	               'self.postMessage(JSON.stringify(msg));'+
				'});',
	onMessage: function (msg) {
	var params = JSON.parse(msg);
	var name = domainToId(extractDomain(params.url));
	var language = langs.getLanguageName(params.lang);
	if (typeof language === 'undefined'){
		language = "english";
	}
	var date = new Date();
	var dateStr = [zero_pad(date.getDate()), zero_pad(date.getMonth()), date.getFullYear()].join('.');
	var msg = format(name, params.title, params.url, dateStr, language.toLowerCase());
	clipboard.set(msg);
	}
});
