$(document).ready(function (){
	environment.load();
	environment.displayConfigs();
	environment.setupMinimizing();
	environment.loadImportMethods();
	
	environment.setupShortCuts();
});

// Local Storage loading and saving.

var environment = {};

var sparqplug = {};
sparqplug.in = {};
sparqplug.out = {};
sparqplug.detail = {};

var plugins = {};

var localStorage = window.localStorage;

environment.load = function () {
	if (localStorage['sparql.config'] != null) {
		this.config = JSON.parse(localStorage['sparql.config']);
	} else {
		this.config = {};
	}
	if (localStorage['sparql.currentDataset'] != null) {
		this.currentDataset = localStorage['sparql.currentDataset'];
	} else {
		this.currendDataset = "";
	}
	
	environment.latestQuery = "";
	environment.latestResults = {};
	
	if (environment.currentDataset != null && environment.currentDataset != "") {
		environment.loadDataset(environment.currentDataset);
	}
}

environment.save = function () {
	localStorage.setItem('sparql.config', JSON.stringify(this.config));
	localStorage.setItem('sparql.currentDataset', this.currentDataset);
}
// Environment Event Binding

/*
  Known events:
	- performedQuery
	- selectedObject
*/

environment.bindingAgents = {};
environment.bindingAgents.performedQuery = [];
environment.bindingAgents.selectedObject = [];

environment.bindToEvent = function (event, callback, data) {
	this.bindingAgents[event].push({
		"callback": callback,
		"data": data
	});
}

environment.triggerEvent = function (event, data) {
	$.each(this.bindingAgents[event], function (index, agent) {
		agent.callback($.extend( agent.data, data ));
	});
}

// Import from File

environment.loadImportMethods = function () {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		//New Way
		$("#import-config-file").hide();
		//$('#datasets .panel-list').prepend("");
	    var dropZone = document.getElementById('import-config-file');
	    dropZone.addEventListener('dragover', handleDragOver, false);
	    dropZone.addEventListener('drop', handleFileSelect, false);
	  //do your stuff!
	}
	
	// Old Way
	$('#import-config-btn').click(function () {
		environment.importConfigFromURL($('#import-config-url').val());
		$('#import-config-url').val("");
	});
	$('#import-config').hide();
	
	$('#import-config-button').click(function (){
	    // Setup the dnd listeners.
		// Check for the various File API support.
		
		$('#import-config').toggle();
		$("#import-config-file").toggle();
	});
}

environment.importConfig = function (file) {
	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = (function(e) {
		var contents = e.target.result;
		environment.importConfigJSON(contents);
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
		if (environment.config[data.name] == null) {
			environment.importConfigJSON(JSON.stringify(data));
		}
	});
}

// Import Global

environment.importConfigJSON = function (json) {
	console.log('JSON: '+json);
	new_config = JSON.parse(json);
	new_config.history = [];
	this.config[new_config.name] = new_config;
	this.currentDataset = new_config.name;
	this.save();
	
	this.displayConfigs();
	this.loadDataset(this.currentDataset);
	
	$("#import-config").hide();
	$("#import-config-file").hide();
}

environment.displayConfigs = function () {
	console.log('load configs: '+this.config);
	$("#datasets .panel-list ul").empty();
	$.each(this.config,function(index,value) {
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
			$('#datasets .panel-list li').removeClass('selected');
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
		$("#datasets .panel-list ul").append(li);
	});
	
	$("#import-config-file").hide();
	$("#import-config-file-hide").click(function(){
		$("#import-config-file").hide();
	});
}

// Datasets

environment.loadDataset = function (dataset) {
	
	this.currentInPlugin = null;
	this.currentOutPlugin = null;
	
	$('#inputs').children().remove();
	$('#data-input .panel-menu-tabs').children().remove();
	
	$('#outputs').children().remove();
	$('#data-output .panel-menu-tabs').children().remove();
	
	$('#details').children().remove();
	$('#detail .panel-menu-tabs').children().remove();
		
	if (dataset != "") {
		$.each(environment.config[dataset].plugins,function (index,value) {
			environment.loadPlugin(value);
		});	
	
		this.currentConfig = this.config[this.currentDataset];
		
		//this.loadHistory();
		
		$('#menu-datasets .name').html(this.currentDataset);
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
	this.displayConfigs();
	this.loadDataset(dataset);
	
	this.editor.close();
}

environment.deleteDataset = function () {
	var dataset = $('#config-editor').data('dataset');
	
	delete this.config[dataset];
	this.currentDataset = "";
	
	
	this.save();
	this.load();
	this.displayConfigs();
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

environment.loadPlugin = function (plugin) { // sparqplug.in.objectbased
	console.log('Loading SparqPlug: '+plugin);
	
	$.getScript('plugins/'+plugin.replace(/\-/g,'.')+'.js', function( data, textStatus, jqxhr ) {
		console.log('Loaded JS for Plugin: '+plugin);
		new_plugin = $("<div/>",{
			id: plugin,
			class: 'plugin-'+plugins[plugin].type
		});
		new_tab = $("<a/>",{
			id: plugin+'-tab',
			title: plugins[plugin].description,
			href:"javascript:environment.viewPlugin('"+plugin+"')"
		});
		new_tab.append('<span class="icons">'+plugins[plugin].icon+'</span> '+plugins[plugin].title);
		
		if (plugins[plugin].type == "in") {
			$('#inputs').append(new_plugin);			
			$('#data-input .panel-menu-tabs').append(new_tab);
			if (environment.currentInPlugin == null) {
				environment.viewPlugin(plugin);
			}
		} else if (plugins[plugin].type == "out") {
			$('#outputs').append(new_plugin);			
			$('#data-output .panel-menu-tabs').append(new_tab);
			if (environment.currentOutPlugin == null) {
				environment.viewPlugin(plugin);
			}
		} else if (plugins[plugin].type == "detail") {
			$('#details').append(new_plugin);			
			$('#detail .panel-menu-tabs').append(new_tab);
			if (environment.currentDetailPlugin == null) {
				environment.viewPlugin(plugin);
			}
		}
		plugins[plugin].load();
		
		if (plugins[plugin].css) {
			$('<link/>', {
			   rel: 'stylesheet',
			   type: 'text/css',
			   href: 'plugins/'+plugins[plugin].css
			}).appendTo('head');
		}
	});
}

environment.viewPlugin = function (plugin) {
	//Switch views
	$('#'+plugin).parent().prepend($('#'+plugin));
	
	$('#'+plugin+"-tab").parent().children().removeClass('selected');
	$('#'+plugin+"-tab").addClass('selected');
	
	if (plugins[plugin].type == "in") {
		this.currentInPlugin = plugin;
		this.currentInPlugin.updateUI();
	} else if (plugins[plugin].type == "out") {
		this.currentOutPlugin = plugin;
		this.currentOutPlugin.updateUI();
	} else if (plugins[plugin].type == "detail") {
		this.currentDetailPlugin = plugin;
	}
}

// Plugin Functions for Querying

environment.performQuery = function (query) {
	console.log('Query: '+query);
	var results = $(document).query(query,this.config[this.currentDataset]);
	if (results.error) {
		plugins[this.currentInPlugin].error(results.response);
		return;
	}
	this.latestQuery = query;
	this.latestResults = results;
	
	this.addToHistory(query);
	
	plugins[this.currentOutPlugin].updateUI();
	plugins[this.currentInPlugin].updateUI();
	
	environment.triggerEvent('performedQuery');
	
}

environment.silentQuery = function (query) {
	console.log('Query: '+query);
	var results = $(document).query(query,this.config[environment.currentDataset]);
	if (results.error) {
		plugins[this.currentInPlugin].error(results.response);
		return;
	}
	return results;
}

// History

environment.addToHistory = function (query) {
	this.config[this.currentDataset].history.push(query);
	this.save();
}

environment.clearHistory = function () {
	this.config[this.currentDataset].history = [];
	this.save();
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
	
	// Datasets
	
	$('#datasets').data('open', false);
	
	$('#menu-datasets').click(function () {
		environment.toggleDatasets();
	});
	
	// Workspace Setup
	
	$('#datasets').setStylesForState({
		left:'-20%'
	},'closed');
	$('#datasets').setStylesForState({
		left:'0%'
	},'open');
	
	$('#detail').setStylesForState({
		
	},'closed');
	$('#detail').setStylesForState({
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
	$('#datasets').jumpToState('closed');
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
		case "datasets-dataarea":
			this.setWorkspaceState('datasets-dataarea-detail');
			break;
		case "dataarea-detail":
			this.setWorkspaceState('dataarea');
			break;
		case "datasets-dataarea-detail":
			this.setWorkspaceState('datasets-dataarea');
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
		case "datasets-dataarea":
			this.setWorkspaceState('datasets-dataarea-detail');
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
		case "datasets-dataarea-detail":
			this.setWorkspaceState('datasets-dataarea');
			break;
		default:
	}
}

environment.toggleDatasets = function () {
	if ($('#datasets').data('open')) {
		environment.hideDatasets();
		$('#datasets').data('open', false);
	} else {
		environment.showDatasets();
		$('#datasets').data('open', true);
	}
}

environment.showDatasets = function () {
	var state = $('#workspace').data('state');
	switch (state) {
		case "dataarea":
			this.setWorkspaceState('datasets-dataarea');
			break;
		case "dataarea-detail":
			this.setWorkspaceState('datasets-dataarea-detail');
			break;
		default:
	}
}

environment.hideDatasets = function () {
	var state = $('#workspace').data('state');
	switch (state) {
		case "datasets-dataarea":
			this.setWorkspaceState('dataarea');
			break;
		case "datasets-dataarea-detail":
			this.setWorkspaceState('dataarea-detail');
			break;
		default:
	}
}

environment.setWorkspaceState = function (state) {
	$('#workspace').data('state',state);
	switch (state) {
		case "dataarea":
			$('#datasets').animateToState('closed');
			$('#data-area').animateToState('full');
			$('#detail').animateToState('closed');
			break;
		case "datasets-dataarea":
			$('#datasets').animateToState('open');
			$('#data-area').animateToState('half-right');
			$('#detail').animateToState('closed');
			break;
		case "datasets-dataarea-detail":
			$('#datasets').animateToState('open');
			$('#data-area').animateToState('half');
			$('#detail').animateToState('open');
			break;
		case "dataarea-detail":
			$('#datasets').animateToState('closed');
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

environment.rotateDatasetViews = function () {
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
