sparqplug.detail.object = {type:"detail","title":"Object","description":"View query history.","icon":"&#xf0e8;","css":"sparqplug.detail.object.css"};

sparqplug.detail.object.load = function () {
	$('#sparqplug-detail-object').append("<ul></ul>")
	environment.bindToEvent('selectedObject', this.selected );
}

sparqplug.detail.object.selected = function (data) {
	obj = data.object;
	
	$detail = $("#sparqplug-detail-object");
	$detail.empty();

	$obj_display = $('<div />',{
		text: $(document).resolvePrefix(obj),
		class: 'header'
	});

	$obj_verbs = $('<div />',{
		class: 'verb-list'
	});

	obj_string = '<'+obj+'>'; // should check for prefix

	// TO-DO stop using versbForObject and verbsForDirectObject.
	// Use custom query that retrieves both at once.

	$obj_verbs.append("<h4>Verbs as Subject</h4>");

	$.each($(document).verbsForObject(obj_string),function (index, verb) {
		$obj_verb = $('<a />',{
			text: $(document).resolvePrefix(verb.value),
			class: 'verb-item'
		});
		$obj_verb.data('obj',obj);
		$obj_verb.data('verb', verb.value);

		$obj_verb.click(function () {
			environment.performQuery('SELECT ?object WHERE { <'+$(this).data('obj')+'> <'+$(this).data('verb')+'> ?object }');
		});

		$obj_verbs.append($obj_verb);
		$obj_verbs.append('<br/>');
	});

	$obj_verbs.append("<h4>Verbs as Object</h4>");

	$.each($(document).verbsForDirectObject(obj_string),function (index, verb) {
		$obj_verb = $('<a />',{
			text: $(document).resolvePrefix(verb.value),
			class: 'verb-item'
		});
		$obj_verb.data('obj',obj);
		$obj_verb.data('verb', verb.value);

		$obj_verb.click(function () {
			environment.performQuery('SELECT ?subject WHERE { ?subject <'+$(this).data('verb')+'> <'+$(this).data('obj')+'> }');
		});

		$obj_verbs.append($obj_verb);
		$obj_verbs.append('<br/>');

	});

	$detail.append($obj_display);
	$detail.append($obj_verbs);
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

plugins['sparqplug-detail-object'] = sparqplug.detail.object;