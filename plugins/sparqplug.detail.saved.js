sparqplug.detail.saved = {type:"detail","title":"Saved","description":"View save and tag queries.","icon":"&#xf1da;","css":"sparqplug.detail.saved.css"};

sparqplug.detail.saved.load = function () {
	$('#sparqplug-detail-saved').append(this.makeSavePanel());
	$input = $('<input />',{
		type:'text',
		placeholder:'Search Tags',
		id:'query-save-search'
	}).change(function () {
		var tag = $(this).val(); //TO-DO search multipe tags at once and have little pills and auto complete
		if (tag == "") {
			$('#sparqplug-detail-saved ul').children().show();
		} else {
			$('#sparqplug-detail-saved ul > li').each(function (index, li) {
				if ($.inArray(tag, $(li).data('tags'))) {
					$(li).hide();
				} else {
					$(li).show();
				}
			});
		}
	})
	$('#sparqplug-detail-saved').append($input);
	$('#sparqplug-detail-saved').append("<ul></ul>");
	
	// Load Initally saved queries.
	
	$.each(this.getSavedQueries(), function (index, query_object) {
		var li = sparqplug.detail.saved.liForSavedQuery(query_object);
		$('#sparqplug-detail-saved ul').append(li);
	});
	$save_button = $('<a />',{
		class:'icons panel-menu-tools',
		title:'Save Query',
		html:"&#xf0c7;"
	}).click(function () {
		$("#query-save-panel #query").val(environment.latestQuery);
		$("#query-save-panel").show();
		console.log('Save Query: '+environment.latestQuery);
	});
	
	$("#data-input > .panel-menu").append($save_button);
}

sparqplug.detail.saved.makeSavePanel = function () {
	$save_panel = $('<div />',{
		id:'query-save-panel',
		class:'header'
	});
	$save_panel.append('<b>Save Query</b><br/>');
	$save_panel.append('<input type="text" id="query" placeholder="Query" /><br/>');
	$save_panel.append('<input type="text" id="tags" placeholder="" /><br/>');
	$save_panel.append('<input type="checkbox" id="cache" >Cache Results<br>');

	$submit_button = $('<a />',{
		text:'Save'
	}).click(function () {
		var query = $save_panel.find('#query').val();
		var tags = $save_panel.find('#tags').val().split(',');
		var cache = $save_panel.find('#cache').is(':checked');
		
		var query_object = {
			query: query,
			tags: tags,
			cache: cache
		}
		
		if (cache) {
			var cached_results = {};
			if (environment.latestQuery.replace(/(\r\n|\n|\r)/gm,"") == query) {
				cached_results = environment.latestResults;
				query_object.query = environment.latestQuery;
			} else {
				cached_results = environment.silentQuery(query);
			}
			query_object.results = cached_results;
		}
		
		environment.config[environment.currentDataset].saved.push(query_object);
		environment.save();
		
		var li = sparqplug.detail.saved.liForSavedQuery(query_object);
		$('#sparqplug-detail-saved ul').append(li);
		
		$save_panel.hide();
	});
	$cancel_button = $('<a />',{
		text:'Cancel'
	}).click(function () {
		$save_panel.hide();
	});
	
	$save_panel.append($submit_button);
	$save_panel.append($cancel_button);
	
	$save_panel.hide();
	
	return $save_panel;
}

sparqplug.detail.saved.getSavedQueries = function () {
	return environment.config[environment.currentDataset].saved;
}

sparqplug.detail.saved.liForSavedQuery = function(query_object) {
	li = $("<li/>").data('tags',query_object.tags);
	if (query_object.cache) {
		li.append($('<div />',{
			text: 'cached',
			class: 'cached'
		}));
	}
	li.append(query_object.query);
	li.click(function(){
		if (query_object.cached) {
			environment.latestQuery = query_object.query;
			environment.latestResults = query_object.results;
			environment.triggerEvent('performedQuery');
		} else {
			environment.performQuery(query_object.query);
		}
		
	});
	
	return li;
}

plugins['sparqplug-detail-saved'] = sparqplug.detail.saved;