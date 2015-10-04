// Documentation generated with jsdoc https://github.com/jsdoc3/jsdoc

$(document).ready(function (){
	environment.load();

});

// Local Storage loading and saving.

/** @namespace */
var environment = {};

// Defaults
environment.latestQuery = [];
environment.latestResults = [];
environment.currentView = "";
environment.panelHTML = '<div class="panel-menu"><div class="panel-menu-tabs"></div>'+
	'<a class="icons panel-menu-tools" title="SparqIt" href="">&#xf045;</a><a class="icons panel-menu-tools" title="Save Query" href="">&#xf0c7;</a>'+
'</div><div class="panel-plugins"></div>';

/** @namespace */
var sparqplug = {};
/** Object to contain any input plugins. */
sparqplug.type = {
	input:'input',
	output:'output',
	detail:'detail',
	update:'update'
}
/** Default object for an input plugin. */
sparqplug.default = {
	"title":"Default Title",
	"description":"Default description.",
	"icon":"",
	load:function () {

	}
}
sparqplug.input = {
	updateUI:function () {
	}
}
/** Default object for an output plugin. */
sparqplug.output = {
	updateUI:function () {
	}
}
/** Default object for a detail plugin. */
sparqplug.detail = {
}
/** Default object for an update plugin. */
sparqplug.update = {
}

/**
 * Method used to create new plugin objects.
 * @param {string} type The
 * @param {string} urn URN of the plugin.
 * @param {object} object The object of the plugin containing all nessesary
 * methods.
 */

sparqplug.create = function (type,urn,object) {
	var plugin = $.extend({
		type:type
	},this.default,this[type],object);
	environment.plugins.add(urn,plugin);
}

/**
 * Function called from within a plugin function to get the plugin object.
 * @param {object} context The jQuery DOM object for the plugin. Always *this*
 * in a function called with the context set.
 */

sparqplug.get = function (context) {
	return environment.plugins.get(context.data('urn'));
}

/** @namespace */
environment.plugins = {
	/**
	 * Gets the plugin object for a given URN.
	 * @param {urn} string URN of plugin.
	 */
	get:function (urn) {
		return this.library[urn];
	},
	/**
	 * Adds the plugin object to the list of plugins.
	 * @param {urn} string URN of plugin.
	 * @param {object} object Object containing all the functions neccessary for a plugin.
	 */
	add:function (urn, object) {
		this.library[urn] = object;
	},
	library:[]
};

var localStorage = window.localStorage;

/**
 * Does the following:
 * - Calls loadConfigurations then display configurations.
 * - Sets up default current view from localStorage.
 * - Calls bindEvents, setupMinimizing, loadImportMethods, setupShortCuts in that order.
 */
environment.load = function () {

	environment.loadConfigurations();

	if (localStorage[this.currentViewKey] != null) {
		this.currentView = localStorage[this.currentViewKey];
	}

	environment.bindEvents();
	environment.setupMinimizing();
	environment.loadImportMethods();
	environment.setupShortCuts();

	environment.history.load();
}

/**
 * Loads configurations for the environment from a configuration json file on
 * the file system. *Overwrite this function to take advantage of a REST API or
 * implement a custom configuration storage protocol.*
 * In order handle asynchronous loading the function must call
 * didLoadConfiguration() for success or failure.
 */
environment.loadConfigurations = function () {
	$.ajax({
		'url':'configuration.json',
		'method':'GET',
		'dataType':'json',
		success:function (data) {
			environment.config = data;
			environment.didLoadConfigurations(true);
		},
		failure: function (event) {
			environment.didLoadConfigurations(false);
		}
	})
}

/**
 * Called upon completion of setting environment.config or called upon failure.
 * @param {bool} success Was loading the configurations successful.
 */
environment.didLoadConfigurations = function (success) {
	if (success) {
		environment.displayConfigurations();
	} else {
		alert('Could not load the configurations for this environment.');
	}
}

environment.save = function () {
	localStorage.setItem(this.configKey, JSON.stringify(this.config));
	localStorage.setItem(this.currentViewKey, this.currentView);
}

// Environment Event Binding

/** @namespace
 * @description Object containing all the events and arrays of callback functions and data.
 * To add an event call *environment.bindToEvent()* with any event name. To
 * trigger an event call *environment.triggerEvent()*
 */
environment.bindingAgents = {
	/** Array of callback functions and data for the performed query event.  */
	performedQuery: [],
	/** Array of callback functions and data for selected object event.  */
	selectedObject: []
};

/**
 * Setup initial binded events.
 * - performedQuery to environment.updateVisiblePlugins()
 */
environment.bindEvents = function () {
	this.bindToEvent('performedQuery', this.updateVisiblePlugins);
}

/**
 * Binds the callback function to trigger upon the given event and offers a data
 * object to be sent to the callback function.
 * @param {string} event Name of the event that should trigger the callback
 * function.
 * @param {function} callback Function called on event.
 * @param {object} data Object sent along with the callback function.
 */

environment.bindToEvent = function (event, callback, data) {
	this.bindingAgents[event].push({
		"callback": callback,
		"data": data
	});
}

/**
 * Triggers the callback functions that have been bound to the event and passes
 * the data object along to the callback function.
 * @param {string} event Name of the event being triggered.
 * @param {object} data Data being passed to the callback functions.
 */

environment.triggerEvent = function (event, data) {
	$.each(this.bindingAgents[event], function (index, agent) {
		agent.callback($.extend( agent.data, data ));
	});
}

// Import from File

environment.loadImportMethods = function () {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		var dropZone = document.getElementById('import-dataset-file');
		dropZone.addEventListener('dragover', handleDragOver, false);
		dropZone.addEventListener('drop', handleFileSelect, false);

		var dropZone = document.getElementById('import-view-file');
		dropZone.addEventListener('dragover', handleDragOver, false);
		dropZone.addEventListener('drop', handleFileSelect, false);
	} else {
		// TO-DO: Implement all way of uploading via URL. Not nesseary if all modern browsers can jsut do a drag and drop file.
	}

	$('#import-dataset-new').click(function () {
		environment.createBlankDataset();
	}).hide();

	$('#import-view-new').click(function () {
		environment.createBlankView();
	}).hide();

	// Datasets
	$('#import-dataset-methods').hide();

	$('#import-dataset-button').click(function (){
	    // Setup the dnd listeners.
		// Check for the various File API support.

		$('#import-dataset-methods').toggle();
	});

	// Views
	$('#import-view-methods').hide();

	$('#import-view-button').click(function (){
	    // Setup the dnd listeners.
		// Check for the various File API support.

		$('#import-view-methods').toggle();
	});
}

environment.importConfig = function (file) {
	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = (function(e) {
		var contents = e.target.result;
		var data = JSON.parse(contents);
		environment.importConfigFromObject(data);
	});

	reader.readAsText(file);
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
			environment.importConfig(f);
    }
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Import from URL

environment.importConfigFromURL = function (url) {
	console.log('importing config from URL: '+url)
	json = $.getJSON( url ,function( data ) {
		this.importConfigFromObject(data);
	});
}

environment.importConfigFromObject = function (data) {
	if (data.type == "dataset") {
		if (environment.config.datasets[data.name] == null) {
			environment.importDatasetJSON(JSON.stringify(data));
		}
	} else if (data.type == "view") {
		if (environment.config.views[data.name] == null) {
			environment.importViewJSON(JSON.stringify(data));
		}
	}
}

// Import Global

environment.importDatasetJSON = function (json) {
	console.log('JSON: '+json);
	new_config = JSON.parse(json);
	new_config.history = [];
	new_config.saved = [];

	this.config.datasets[new_config.name] = new_config;
	this.currentView = new_config.name;
	this.save();

	this.displayConfigurations();
	this.loadView(this.currentView);

	$('#import-dataset-button').trigger('click');
}

environment.importViewJSON = function (json) {
	console.log('JSON: '+json);
	new_config = JSON.parse(json);
	new_config.history = [];
	new_config.saved = [];

	this.config.views[new_config.name] = new_config;
	this.currentView = new_config.name;
	this.save();

	this.displayConfigurations();
	this.loadView(this.currentView);

	$('#import-view-button').trigger('click');
}

// Create Blank

environment.createBlankDataset = function () {
	name = "New Dataset";
	number = 1;
	while (this.config.datasets[name] != null) {
		name = "New Dataset "+number;
		number++;
	}
	blank = {
		"name":name,
		"description":"",
		"source":"",
		"prefixes":{
			"rdf:":"http://www.w3.org/1999/02/22-rdf-syntax-ns#"
		},
		"variables":{
		}
	}
	this.importDatasetJSON(JSON.stringify(blank))
	environment.editDataset("New Dataset");
}

environment.createBlankView = function () {
	name = "New View";
	number = 1;
	while (this.config.views[name] != null) {
		name = "New View "+number;
		number++;
	}
	blank = {
		"name":name,
		"dataset":null,
		"plugins":["sparqplug-in-text","sparqplug-out-json","sparqplug-out-table","sparqplug-detail-history","sparqplug-detail-saved","sparqplug-detail-object"]
	}
	this.importDatasetJSON(JSON.stringify(blank))
	environment.editDataset("New Dataset");
}

environment.displayConfigurations = function () {
	console.log('load configs: '+this.config);
	$("#configs .panel-list ul").empty();

	$.each(this.config.datasets,function(index,value) {
		console.log('config: '+value.name);

		li_edit = $('<span/>',{
			class:'edit',
			text:'edit'
		}).click(function () {
			dataset = $(this).parent().data('id');
			environment.editDataset(dataset);
		}).hide();

		li = $('<li/>',{
			text:value.name,
			title:value.description
		}).data('id',value.name).click(function () {
			dataset = $(this).data('id');
			console.log("load dataset: "+dataset);
			environment.currentDataset = dataset;
			$('#configs .panel-list li').removeClass('selected');
			$(this).addClass('selected');
			environment.save();

			environment.loadDataset(dataset);
		}).hover(function () {
			$(this).find('.edit').show();
		},function () {
			$(this).find('.edit').hide();
		}).append(li_edit);

		if (environment.currentDataset == value.name) {
			li.addClass('selected');
		}
		$("#datasets ul").append(li);
	});

	$.each(this.config.views,function(index,value) {
		console.log('config: '+value.name);

		li_edit = $('<span/>',{
			class:'edit',
			text:'edit'
		}).click(function () {
			dataset = $(this).parent().data('id');
			environment.editDataset(dataset);
		}).hide();

		li = $('<li/>',{
			text:value.name,
			title:value.description
		}).data('id',value.name).click(function () {
			view = $(this).data('id');
			console.log("load view: "+view);
			environment.currentView = view;
			$('#configs .panel-list li').removeClass('selected');
			$(this).addClass('selected');
			environment.save();

			environment.loadView(view);
		}).hover(function () {
			$(this).find('.edit').show();
		},function () {
			$(this).find('.edit').hide();
		}).append(li_edit);

		if (environment.currentView == value.name) {
			li.addClass('selected');
		}
		$("#views ul").append(li);
	});
}

// Configs
/**
 * First the function clears the workspace, then it loads the view's plugins to the workspace.
 * @param {string} view Unique name of the view to be loaded.
 */
environment.loadView = function (view) {

	this.clearWorkspace();

	if (view != "") {
		var viewConfig = environment.getViewObject(view);

		// Input panels
		var number_of_panels = viewConfig.plugins.input.length;
		$.each(viewConfig.plugins.input,function (index,panel_config) {
			panelID = 'input-panel-'+index;
			$panel = $('<div />',{
				'class':'input-panel panel',
				'id':panelID,
				html:environment.panelHTML
			}).data('index',index);
			$panel.css('width',(100/number_of_panels)+'%');

			$('#data-input').append($panel);

			$.each(panel_config.plugins, function (index, pluginURN) {
				environment.loadPlugin(pluginURN,'#'+panelID);
				if (index == 0) {
					var pluginClass = environment.sanitizeURNForClassName(pluginURN);
					$('#'+panelID+' .'+pluginClass+'-tab').trigger('click');
				}
			});
		});

		// Output panels
		$('#data-output').append($('<div />',{
			id:'output-panel',
			html: environment.panelHTML
		}));
		$.each(viewConfig.plugins.output,function (index,pluginURN) {
			environment.loadPlugin(pluginURN,'#output-panel');
			if (index == 0) {
				var pluginClass = environment.sanitizeURNForClassName(pluginURN);
				$('#output-panel .'+pluginClass+'-tab').trigger('click');
			}
		});

		// Detail panels
		$('#detail').append($('<div />',{
			id:'detail-panel',
			html: environment.panelHTML
		}));
		$.each(viewConfig.plugins.detail,function (index,pluginURN) {
			environment.loadPlugin(pluginURN,'#detail-panel');
			if (index == 0) {
				var pluginClass = environment.sanitizeURNForClassName(pluginURN);
				$('#detail-panel .'+pluginClass+'-tab').trigger('click');
			}
		});

		this.currentView = view;

		$('#menu-configs .name').html(this.currentView);
	}

}

environment.clearWorkspace = function () {
	this.currentInPlugins = [];
	this.currentOutPlugin = null;

	$('#data-input').empty();
	$('#data-output').empty();
	$('#detail').empty();

}

/**
 * Gets view the object from ```environment.config```.
 * @param {string} view Unique name of the view being retrieved.
 */
environment.getViewObject = function (view) {
	for (var index in this.config.views) {
		if (this.config.views[index].name == view) {
			return this.config.views[index];
		}
	}
}

environment.loadStandAloneDataset = function (configURL) {
	this.importConfigFromURL(configURL);
	$('<link/>', {
	   rel: 'stylesheet',
	   type: 'text/css',
	   href: 'css/standalone.css'
	}).appendTo('head');
}

environment.editDataset = function (dataset) {
	this.editor.open();

	edit_config = this.config[dataset];

	$('#config_editor_name').val(edit_config.name);
	$('#config_editor_description').val(edit_config.description);
	$('#config_editor_source').val(edit_config.source);

	$('#config_editor_prefixes').empty();
	$.each(edit_config.prefixes, function (key, value) {
		var li = $('<li />');
		li.append('<input type="text" class="config_editor_prefixes_key" value="'+key+'" />');
		li.append('<input type="text" class="config_editor_prefixes_value" value="'+value+'" />');
		$('#config_editor_prefixes').append(li);
	});

	$('#config_editor_prefixes_add').click(function() {
		var li = $('<li />');
		li.append('<input type="text" class="config_editor_prefixes_key" value="" placeholder="Key" />');
		li.append('<input type="text" class="config_editor_prefixes_value" value="" placeholder="Value" />');
		$('#config_editor_prefixes').append(li);
	});

	$('#config-editor').data('dataset',dataset);
}

environment.saveDataset = function () {
	var dataset = $('#config-editor').data('dataset');

	if (dataset !=  $('#config_editor_name').val()) {
		this.config[$('#config_editor_name').val()] = this.config[dataset];
		this.config[$('#config_editor_name').val()].name = $('#config_editor_name').val();
		delete this.config[dataset];
		dataset = $('#config_editor_name').val();
	}

	this.config[dataset].description = $('#config_editor_description').val();
	this.config[dataset].source = $('#config_editor_source').val();

	var prefixes_new = {};
	$('#config_editor_prefixes').children().each(function (index,li) {
		var key = $(li).find('.config_editor_prefixes_key').val();
		var value = $(li).find('.config_editor_prefixes_value').val();
		if (key != "" && value != "") {
			prefixes_new[key] = value;
		}
	});

	this.config[dataset].prefixes = prefixes_new;

	this.save();
	this.load();
	this.displayConfigurations();
	this.loadDataset(dataset);

	this.editor.close();
}

environment.deleteDataset = function () {
	var dataset = $('#config-editor').data('dataset');

	delete this.config[dataset];
	this.currentDataset = "";


	this.save();
	this.load();
	this.displayConfigurations();
	this.loadDataset("");

	this.editor.close();

}

// Dataset Editor

environment.editor = {};
environment.editor.open = function () {
	$('#config-editor').css({
		'display':'initial',
		'height':'60%',
		'top':'10%'
	});
}

environment.editor.close = function () {
	$('#config-editor').css({
		'display':'none',
		'height':'0%',
		'top':'100%'
	});
}

// Plugins

environment.pluginBaseURL = '';

/**
 * First it loads the resources needed for the plugin *(calling environment.resolver.resolvePluginURN(urn))*. Loads the plugin into a panel in the workspace.
 * @param {string} URN for the plugin.
 * @param {string} ID of the panel where the plugin should be loaded into.
 */

environment.loadPlugin = function (plugin, panel) { // sparqplug.in.objectbased
	console.log('Loading SparqPlug: '+plugin);

	this.resolver.resolvePluginURN(plugin,function (success) {
		var pluginClass = environment.sanitizeURNForClassName(plugin);
		var pluginObject = environment.plugins.get(plugin);

		new_plugin = $("<div/>",{
			class: plugin+' plugin plugin-'+pluginObject.type
		}).data('urn',plugin);
		new_tab = $("<a/>",{
			class: plugin+'-tab',
			title: pluginObject.description,
			click:function () {
				var pluginClass = environment.sanitizeURNForClassName($(this).data('urn'));
				environment.viewPlugin($(this).parent().data('panel')+' .'+pluginClass);
			}
		}).data('urn',plugin);
		new_tab.append('<span class="icons">'+pluginObject.icon+'</span> '+pluginObject.title);

		$(panel+' .panel-plugins').append(new_plugin);
		$(panel+' .panel-menu-tabs').append(new_tab);
		$(panel+' .panel-menu-tabs').data('panel',panel);

		pluginObject.load.call($(panel+' .'+pluginClass));
	});
}

/**
 * Sanitize the plugin URN to be used as a class name.
 * @param {string} urn Plugin URN to be sanitized.
 * @return {string} Sanitized URN
 */

environment.sanitizeURNForClassName = function (urn) {
	// Valid characters in a CSS identifier are:
 // - the hyphen (U+002D)
 // - a-z (U+0030 - U+0039)
 // - A-Z (U+0041 - U+005A)
 // - the underscore (U+005F)
 // - 0-9 (U+0061 - U+007A)
 // - ISO 10646 characters U+00A1 and higher
 // We strip out any character not in the above list.
 return urn.replace(/\./g,"\\.").replace(/\:/g,"\\:");
}

/**
 * Called to display the plugin in its parent panel.
 * @param {string} selector Selector for the DOM object for the plugin.
 */

environment.viewPlugin = function (selector) {
	//Switch views
	var panel_index = $(selector).parents('.panel').data('index');
	$(selector).parent().prepend($(selector));

	$(selector+"-tab").parent().children().removeClass('selected');
	$(selector+"-tab").addClass('selected');

	urn = $(selector).data('urn');

	if (this.plugins.get(urn).type == sparqplug.type.input) {
		this.currentInPlugins[panel_index] = urn;
		this.plugins.get(urn).updateUI.call($(selector));
	} else if (this.plugins.get(urn).type == sparqplug.type.output) {
		this.currentOutPlugin = urn;
		this.plugins.get(urn).updateUI.call($(selector));
	} else if (this.plugins.get(urn).type == sparqplug.type.detail) {
		this.currentDetailPlugin = urn;
	}
}

// Plugin Functions for Querying

/**
 * Gets the current datasets for the panel the plugin calling current datasets
 * is in.
 * @return {array} Array of names of the datasets for the panel.
 */

environment.currentDatasets = function () {
	var panel_index = this.parents('.panel').data('index');
	return environment.getViewObject(environment.currentView).plugins.input[panel_index].datasets;
}

/**
 * Get the dataset object by name.
 * @param {string} dataset The name of the dataset.
 * @return {object} Dataset object.
 */

environment.getDatasetObject = function (dataset) {
	for (var index in this.config.datasets) {
		if (this.config.datasets[index].name == dataset) {
			return this.config.datasets[index];
		}
	}
}

/**
 * Perform the given query on the datasets for the panel and runs updateUI for
 * each of the output plugins.
 * @param {string} query SPARQL query strings.
 */

environment.performQuery = function (query) {
	console.log('Query: '+query);
	var panel_index = this.parents('.panel').data('index');

	var panel_results = [];
	var datasets = [];
	var that = this;
	$.each(environment.currentDatasets.call(this), function (index, dataset) {
		var results = $.query(query,environment.getDatasetObject(dataset));
		if (results.error) {
			environment.plugins.get(that.data('urn')).error.call(that,results);
			return;
		}
		datasets.push(dataset);
		panel_results.push({'results':results,'dataset':dataset});
	});

	environment.latestResults[panel_index] = panel_results;
	environment.latestQuery[panel_index] = query;

	environment.history.add(query,datasets);

	environment.triggerEvent('performedQuery');
}

environment.updateVisiblePlugins = function () {
	$.each(environment.currentInPlugins, function (panelIndex,plugin) {
		environment.plugins.get(plugin).updateUI.call($('#input-panel-'+panelIndex+' .'+environment.sanitizeURNForClassName(plugin)));
	});
	environment.plugins.get(environment.currentOutPlugin).updateUI.call($('#output-panel .'+environment.sanitizeURNForClassName(environment.currentOutPlugin)));
}

/**
 * Perform a query without calling the
 * @param {string} query SPARQL query string.
 * @return {object} Results object.
 */

environment.silentQuery = function (query) {
	console.log('Query: '+query);
	// TO-DO modify to handle multiple datasets.
	var results = $(document).query(query,this.currentDataset());
	if (results.error) {
		plugins[this.currentInPlugin].error(results.response);
		return;
	}
	return results;
}

// Layout Functionality

environment.setupMinimizing = function () {
	$("#data-input").setStylesForState({
		'height': '100%',
		'width':'100%'//'calc(100% - 25px)'
	},'horizontal-full-open');
	$("#data-input").setStylesForState({
		'height': '50%',//'calc(100% - 25px)'
		'width':'100%'
	},'horizontal-half-open'); //Be Optimistic!
	$("#data-input").setStylesForState({
		'height': '100%',
		'width': '50%',
	},'vertical-half-open');
	$("#data-input").setStylesForState({
		'height': '100%',
		'width': '100%',
	},'vertical-full-open');

	$("#data-output").setStylesForState({
		'top':'0%',
		'height':'100%',
		'border-top':'0px'
	},'horizontal-full-open');
	$("#data-output").setStylesForState({
		'top':'50%',
		'height':'50%',
		'left' : '0%',
		'width' : '100%'
	},'horizontal-half-open');
	$("#data-output").setStylesForState({
		'top':'100%',
		'height':'50%'
	},'horizontal-closed');
	$("#data-output").setStylesForState({
		'height': '100%',
		'width': '50%',
		'top' : '0%',
		'left' : '50%'
	},'vertical-half-open');
	$("#data-output").setStylesForState({
		'height': '100%',
		'width': '100%',
		'top' : '0%',
		'left' : '0%'
	},'vertical-full-open');
	$("#data-output").setStylesForState({
		'height': '100%',
		'width': '50%',
		'top' : '0%',
		'left' : '100%',
		'border-left': '0px'
	},'vertical-closed');


	$("#data-area").data('horizontal', true);
	$('#data-input').jumpToState('horizontal-half-open');
	$("#data-output").jumpToState('horizontal-half-open');
	$('#data-output').css('border-top','1px solid #999');

	// Configs

	$('#configs').data('open', false);

	$('#menu-configs').click(function () {
		environment.toggleConfigs();
	});

	// Workspace Setup

	$('#configs').setStylesForState({
		left:'-20%'
	},'closed');
	$('#configs').setStylesForState({
		left:'0%'
	},'open');

	$('#detail').setStylesForState({
		left: '100%'
	},'closed');
	$('#detail').setStylesForState({
		left: '80%'
	},'open');

	$('#data-area').setStylesForState({
		width:'100%',
		left: '0%'
	},'full');
	$('#data-area').setStylesForState({
		width:'80%',
		left: '0%'
	},'half-left');
	$('#data-area').setStylesForState({
		width:'80%',
		left: '20%'
	},'half-right');
	$('#data-area').setStylesForState({
		width:'60%',
		left: '20%'
	},'half');

	$('#workspace').data('state', "dataarea");
	$('#configs').jumpToState('closed');
	$('#data-area').jumpToState('full');
	$('#detail').jumpToState('closed');

	// Full Screen
	// The plugin sets the $.support.fullscreen flag:
	if($.support.fullscreen){
	    $('#fullScreen').click(function(e){
	        $('body').fullScreen();
	    });
	}

	$("#details-toggle").click(function () {
		environment.toggleDetailView()
	});
}

environment.toggleDetailView = function () {
	var state = $('#workspace').data('state');
	switch (state) {
		case "dataarea":
			this.setWorkspaceState('dataarea-detail');
			break;
		case "configs-dataarea":
			this.setWorkspaceState('configs-dataarea-detail');
			break;
		case "dataarea-detail":
			this.setWorkspaceState('dataarea');
			break;
		case "configs-dataarea-detail":
			this.setWorkspaceState('configs-dataarea');
			break;
		default:
	}
}

environment.showDetailView = function () {
	var state = $('#workspace').data('state');
	switch (state) {
		case "dataarea":
			this.setWorkspaceState('dataarea-detail');
			break;
		case "configs-dataarea":
			this.setWorkspaceState('configs-dataarea-detail');
			break;
		default:
	}
}

environment.hideDetailView = function () {
	var state = $('#workspace').data('state');
	switch (state) {
		case "dataarea-detail":
			this.setWorkspaceState('dataarea');
			break;
		case "configs-dataarea-detail":
			this.setWorkspaceState('configs-dataarea');
			break;
		default:
	}
}

environment.toggleConfigs = function () {
	if ($('#configs').data('open')) {
		environment.hideConfigs();
		$('#configs').data('open', false);
	} else {
		environment.showConfigs();
		$('#configs').data('open', true);
	}
}

environment.showConfigs = function () {
	var state = $('#workspace').data('state');
	switch (state) {
		case "dataarea":
			this.setWorkspaceState('configs-dataarea');
			break;
		case "dataarea-detail":
			this.setWorkspaceState('configs-dataarea-detail');
			break;
		default:
	}
}

environment.hideConfigs = function () {
	var state = $('#workspace').data('state');
	switch (state) {
		case "configs-dataarea":
			this.setWorkspaceState('dataarea');
			break;
		case "configs-dataarea-detail":
			this.setWorkspaceState('dataarea-detail');
			break;
		default:
	}
}

environment.setWorkspaceState = function (state) {
	$('#workspace').data('state',state);
	switch (state) {
		case "dataarea":
			$('#configs').animateToState('closed');
			$('#data-area').animateToState('full');
			$('#detail').animateToState('closed');
			break;
		case "configs-dataarea":
			$('#configs').animateToState('open');
			$('#data-area').animateToState('half-right');
			$('#detail').animateToState('closed');
			break;
		case "configs-dataarea-detail":
			$('#configs').animateToState('open');
			$('#data-area').animateToState('half');
			$('#detail').animateToState('open');
			break;
		case "dataarea-detail":
			$('#configs').animateToState('closed');
			$('#data-area').animateToState('half-left');
			$('#detail').animateToState('open');
			break;

		default:

	}
}

environment.equalizeInputsOutputs = function () {
	$('#menu-window').children().removeClass('selected');
	$('#window-equal').addClass('selected');

	$('#'+this.currentOutPlugin+"-tab").addClass('selected');
	$('#'+this.currentInPlugin+"-tab").addClass('selected');

	if ($("#data-area").data('horizontal')) {
		$('#data-input').animateToState('horizontal-half-open');
		$('#data-output').animateToState('horizontal-half-open');
		$('#data-output').css('border-top','1px solid #999');
	} else {
		$('#data-input').animateToState('vertical-half-open');
		$('#data-output').animateToState('vertical-half-open');
		$('#data-output').css('border-left','1px solid #999');
	}

}

environment.maximizeOutputs = function () {
	$('#menu-window').children().removeClass('selected');
	$('#window-output').addClass('selected');

	$('#data-input .panel-menu-tabs').children().removeClass('selected');
	$('#'+this.currentOutPlugin+"-tab").addClass('selected');

	if ($("#data-area").data('horizontal')) {
		$('#data-input').animateToState('horizontal-half-open');
		$("#data-output").animateToState('horizontal-full-open');
	} else {
		$('#data-input').animateToState('vertical-half-open');
		$("#data-output").animateToState('vertical-full-open');
	}
}

environment.maximizeInputs = function () {
	$('#menu-window').children().removeClass('selected');
	$('#window-input').addClass('selected');

	$('#data-output .panel-menu-tabs').children().removeClass('selected');
	$('#'+this.currentInPlugin+"-tab").addClass('selected');

	if ($("#data-area").data('horizontal')) {
		$('#data-input').animateToState('horizontal-full-open');
		$('#data-output').animateToState('horizontal-closed');
	} else {
		$('#data-input').animateToState('vertical-full-open');
		$('#data-output').animateToState('vertical-closed');
	}
}

environment.rotateDataArea = function () {
	if ($("#data-area").data('horizontal')) {
		$("#data-area").data('horizontal', false);
		$('#data-input').jumpToState('vertical-half-open');
		$('#data-output').jumpToState('vertical-half-open');
		$('#data-output').css('border-left','1px solid #999');
		$('#data-output').css('border-top','0px solid #999');
		$('#data-output').css('margin-left','-1px');
		$("#menu-window").addClass('rotate');
	} else {
		$("#data-area").data('horizontal', true);
		$('#data-input').jumpToState('horizontal-half-open');
		$('#data-output').jumpToState('horizontal-half-open');
		$('#data-output').css('border-left','0px solid #999');
		$('#data-output').css('border-top','1px solid #999');
		$('#data-output').css('margin-left','0px');
		$("#menu-window").removeClass('rotate');
	}

}

function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

/* Extender to jQuery for saving minimized states */

;(function( $ ) {

    $.fn.setStylesForState = function(styles , state) {
		$(this).data('style-'+state,styles);
	}

	$.fn.animateToState = function (state) {
		$(this).animate($(this).data('style-'+state));
	}
	$.fn.jumpToState = function (state) {
		$(this).css($(this).data('style-'+state));
	}

}( jQuery ));

// Replace the normal jQuery getScript function with one that supports
// debugging and which references the script files as external resources
// rather than inline.
jQuery.extend({
   getScript: function(url, callback) {
      var head = document.getElementsByTagName("head")[0];
      var script = document.createElement("script");
      script.src = url;

      // Handle Script loading
      {
         var done = false;

         // Attach handlers for all browsers
         script.onload = script.onreadystatechange = function(){
            if ( !done && (!this.readyState ||
                  this.readyState == "loaded" || this.readyState == "complete") ) {
               done = true;
               if (callback)
                  callback();

               // Handle memory leak in IE
               script.onload = script.onreadystatechange = null;
            }
         };
      }

      head.appendChild(script);

      // We handle everything using the script element injection
      return undefined;
   },
});

// Shortcuts

environment.setupShortCuts = function () {
	$(document).keydown(function(e) {
		console.log('keydown : '+e.keyCode);
		if (e.keyCode == 18) {
			$(this).data('alting',true);
		} else if ($(this).data('alting') == true && e.keyCode == 79) { // alt-o
			environment.detailObject(environment.getSelectedText());
		}
	});
	$(document).keyup(function(e) {
		if (e.keyCode == 18) {
			$(this).data('alting',false);
		}
	});
}

environment.getSelectedText = function () {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

// Details

environment.detailObject = function (obj) {
	environment.showDetailView();
	$detail = $("#detail .content");
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
			environment.plugins[environment.currentInPlugin].updateUI();
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
			environment.plugins[environment.currentInPlugin].updateUI();
		});

		$obj_verbs.append($obj_verb);
		$obj_verbs.append('<br/>');

	});

	$detail.append($obj_display);
	$detail.append($obj_verbs);

}
