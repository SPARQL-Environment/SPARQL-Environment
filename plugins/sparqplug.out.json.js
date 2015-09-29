sparqplug.out.json = {type:"out","title":"JSON Viewer","description":"View results in a JSON tree.","icon":"&#xf121;","css":"sparqplug.out.json.css"};
environment.plugins.add('urn:sparqplug:sparqlenvironment.out.json:0.1',sparqplug.out.json);

sparqplug.out.json.load = function (selector) {

}

sparqplug.out.json.updateUI = function (selector) {
	$(selector).JSONView(environment.latestResults);
}
