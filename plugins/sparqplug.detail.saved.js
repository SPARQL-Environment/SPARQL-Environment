sparqplug.detail.saved = {type:"detail","title":"Saved","description":"View save and tag queries.","icon":"&#xf07c;","css":"sparqplug.detail.saved.css"};

sparqplug.detail.saved.load = function () {
	$('#sparqplug-detail-saved').append(this.makeSavePanel());
	
	$input = $('<input />',{
		type:'text',
		placeholder:'Search Tags',
		id:'query-save-search'
	}).change(function () {
		var tag = $(this).val(); //TO-DO search multiple tags at once and have little pills and auto complete
		if (tag == "") {
			$('#sparqplug-detail-saved ul').children().show();
		} else {
			$('#sparqplug-detail-saved ul > li').each(function (index, li) {
				if ($.inArray(tag, $(li).data('tags')) == -1) {
					$(li).hide();
				} else {
					$(li).show();
					$(li).highlightTags([tag]);
				}
			});
		}
	})
	$('#sparqplug-detail-saved').append($input);
	$('#sparqplug-detail-saved').append("<ul></ul>");
	
	// Load Initally saved queries.
	this.reloadQueries();
	
	$save_button = $('<a />',{
		class:'icons panel-menu-tools',
		title:'Save Query',
		html:"&#xf0c7;"
	}).click(function () {
		$("#query-save-panel").data('save_to_index', -1);
		$("#query-save-panel #query").val(environment.latestQuery);
		$("#query-save-panel").show();
		console.log('Save Query: '+environment.latestQuery);
	});
	
	$("#data-input > .panel-menu").append($save_button);
}

sparqplug.detail.saved.reloadQueries = function () {
	$('#sparqplug-detail-saved li').remove();
	$.each(this.getSavedQueries(), function (index, query_object) {
		query_object.index = index;
		var li = sparqplug.detail.saved.liForSavedQuery(query_object);
		$('#sparqplug-detail-saved ul').append(li);
	});
}

sparqplug.detail.saved.makeSavePanel = function () {
	var $save_panel = $('<div />',{
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
		var cache = $save_panel.find('#cache').prop('checked');
		
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
		
		index = environment.config[environment.currentDataset].saved.length;
		if ($('#query-save-panel').data('save_to_index') == -1) {
			environment.config[environment.currentDataset].saved.push(query_object);
			query_object.index = index;
			var li = sparqplug.detail.saved.liForSavedQuery(query_object);
			$('#sparqplug-detail-saved ul').append(li);
		} else {
			environment.config[environment.currentDataset].saved[$('#query-save-panel').data('save_to_index')] = (query_object);
			sparqplug.detail.saved.reloadQueries();
		}
		
		environment.save();
		
		$save_panel.hide();
	});
	
	this.loadQuery = function (query_object) {
		$save_panel.find('#query').val(query_object.query);
		$save_panel.find('#tags').val(query_object.tags.join(","));
		if (query_object.cache) {
			$save_panel.find('#cache').prop('checked', true);
		}
		
		$save_panel.data('save_to_index', query_object.index);
	}
	
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

$.fn.highlightTags = function (tags) {
	this.find('.tag').each(function (index, tag) {
		if ($.inArray(this.innerHTML,tags)) {
			$(tag).addClass('grayedOut');
		} else {
			$(tag).removeClass('grayedOut');
		}
	});
}

sparqplug.detail.saved.liForSavedQuery = function(query_object) {
	var li = $("<li/>").data('tags',query_object.tags);
	
	if (query_object.cache) {
		li.append($('<div />',{
			text: 'cached',
			class: 'cached'
		}));
	}
	
	// Editing
	
	li.showEditingTools = function () {
		$(this).find('.delete').show();
		$(this).find('.edit').show();
	}
	li.hideEditingTools = function () {
		$(this).find('.delete').hide();
		$(this).find('.edit').hide();
	}
	li.hover(li.showEditingTools, li.hideEditingTools);
	
	$a_edit = $('<a />',{
		class: 'edit icons',
		html:'&#xf040;'
	}).click(function () {
		li.edit();
	}).hide();
	
	$a_delete = $('<a />',{
		class: 'delete icons',
		html:'&#xf00d;'
	}).click(function () {
		li.delete();
	}).hide();
		
	li.prepend($a_edit);
	li.prepend($a_delete);
	
	// Query
	li.append(query_object.query);
	
	// Tags
	tags = $("<div />",{
		class: 'tags'
	});
	$.each(query_object.tags, function (index, tag) {
		tags.append($('<span />',{
			text: tag,
			class: 'tag'
		}));
		tags.append("&nbsp;");
	});
	li.append(tags);
	
	// Click
	li.click(function(){
		if (query_object.cached) {
			environment.latestQuery = this.query_object.query;
			environment.latestResults = query_object.results;
			environment.triggerEvent('performedQuery');
		} else {
			environment.performQuery(query_object.query);
		}
		
	});
	
	li.delete = function () {
		environment.config[environment.currentDataset].saved.splice( query_object.index, 1 );
		environment.save();
		sparqplug.detail.saved.reloadQueries();
	}
	
	li.edit = function () {
		sparqplug.detail.saved.loadQuery(query_object);
		$('#query-save-panel').show();
	}
	
	return li;
}

plugins['sparqplug-detail-saved'] = sparqplug.detail.saved;