sparqplug.create(sparqplug.type.output,'urn:sparqplug:sparqlenvironment.out.json:0.1',{
	"title":"JSON Viewer",
	"description":"View results in a JSON tree.",
	"icon":"&#xf121;",
	"css":"sparqplug.out.json.css",
	load:function () {

	},
	updateUI:function () {
		this.JSONView(environment.latestResults);
	}
});
