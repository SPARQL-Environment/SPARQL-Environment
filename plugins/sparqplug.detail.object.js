sparqplug.detail.object = {type:"detail","title":"Object","description":"View query history.","icon":"&#xf0e8;","css":"sparqplug.detail.object.css"};
environment.plugins.add('urn:sparqplug:sparqlenvironment.detail.object:0.1',sparqplug.detail.object);

sparqplug.detail.object.load = function (selector) {
	$(selector).append("<ul></ul>")
	environment.bindToEvent('selectedObject', this.selected, {'selector':selector} );
}

sparqplug.detail.object.selected = function (data) {
	obj = data.object;
	datasetObject = environment.getDatasetObject(data.dataset);

	$detail = $(data.selector);
	$detail.empty();

	$obj_display = $('<div />',{
		text: $.resolvePrefix(obj,datasetObject),
		class: 'header'
	});

	$obj_verbs = $('<div />',{
		class: 'verb-list'
	});

	obj_string = '<'+obj+'>'; // should check for prefix

	// TO-DO stop using versbForObject and verbsForDirectObject.
	// Use custom query that retrieves both at once.

	$obj_verbs.append("<h4>Verbs as Subject</h4>");

	$.each($.verbsForObject(obj_string,datasetObject),function (index, verb) {
		$obj_verb = $('<a />',{
			text: $.resolvePrefix(verb.value,datasetObject),
			class: 'verb-item'
		});
		$obj_verb.data('obj',obj);
		$obj_verb.data('verb', verb.value);

		$obj_verb.click(function () {
			environment.performQuery('SELECT ?object WHERE { <'+$(this).data('obj')+'> <'+$(this).data('verb')+'> ?object }',data.dataset);
		});

		$obj_verbs.append($obj_verb);
		$obj_verbs.append('<br/>');
	});

	$detail.append($obj_verbs);

	$obj_verbs.append("<h4>Verbs as Object</h4>");

	$.each($.verbsForDirectObject(obj_string,datasetObject),function (index, verb) {
		$obj_verb = $('<a />',{
			text: $.resolvePrefix(verb.value,datasetObject),
			class: 'verb-item'
		});
		$obj_verb.data('obj',obj);
		$obj_verb.data('verb', verb.value);

		$obj_verb.click(function () {
			environment.performQuery('SELECT ?subject WHERE { ?subject <'+$(this).data('verb')+'> <'+$(this).data('obj')+'> }',datasetObject);
		});

		$obj_verbs.append($obj_verb);
		$obj_verbs.append('<br/>');

	});

	$detail.append($obj_display);
}

sparqplug.detail.object.createHistoryli = function (query, index) {
	li = $("<li/>",{
				text: query
			}).click(function(){
				query = this.innerHTML;
				environment.performQuery(query);
			});
			return li;
}
