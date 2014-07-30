# SparqPlugs

*Plugins for the SPARQL Environment to either aid in the writing of SPARQL Queries or the presentation of the results.*

## Input

Responsibilities of an input SparqPlug are:

- Take user input.
- Create a SPARQL Query object.
- Take a SPARQL Query and update the UI without changing the original query.

## Output

Responsibilities of an output SparqPlug are:

- Take query results.
- Display results.

## Detail

Assists input and/or output plugins and has no responsibilities other than to be useful. It can:

- Perform queries. *(i.e. History and Saved perform queries when a user clicks on a list item)*
- Provide extra information about objects or verbs. *(i.e. The objects plugin looks up verbs for an object)*
- Provide lists of verbs, objects, elements or data specific information.

## Contributing

To contribue to the SPARQL Environment repository itself plugins must be data agnostic. If you're creating data-specific plugins you should create your own GIT repository and name it *sparqplug-{name}* or if you're creating a suite of plugins for your data *sparqplugs-{namespace}*. Examples are *sparqplugs-hmt* or *sparqplugs-cts*.

### Required Functions

The **discription object** contains the basic information the SPARQL Environment uses to distinquish and setup your plugin.

```
sparqplug.in.* = {
	"type":"in", // "in" "out" or "detail" depending on the type of plugin.
	"title": "Text Query", // String used to identify your plugin in plain text (tab bar).
	"description":"Basic SPARQL query box.", // String used to describe your plugin in plain text (tooltip).
	"icon":"&#xf040;", // Icon used to identify your plugin. Font-Awesome is included.
	"css":"sparqplug.in.*.css" // The CSS file which goes along with your plugin.
};
```

**load** is called *once* when the plugin is first created. This is where you setup your plugins DOM structure. The element containing your plugin is always your plugins dashed identifier.

```
sparqplug.in.*.load = function () {
	// Create element for plugin
	$input = $('<input />',{
		id: 'query_box'
	}).change(this.queryChanged);
	
	// Add it to the plugin element
	$("#sparqplug-in-*").append($input);
}
```

**Add** your plugin to the plugins array.

`plugins['sparqplug-in-*'] = sparqplug.in.*;`

#### Input and Output Plugins Only

**updateUI** is called whenever the *environemnt.latestQuery* changes. This is rare for input plugins but output plugins use this function to update their UI to reflect the *environment.latestResults*.

```
sparqplug.in.*.updateUI = function () {
	$('#query_box').val(environment.latestQuery);
}
```
*for output plugins*
```
sparqplug.out.*.updateUI = function () {
	$('#results_box').html(environment.latestResults);
}
```

**error** is called whenever there was an error from the last query.

```
sparqplug.in.*.error = function () {
	$('#query_box').css('color':'red');
}
```

### Custom Functions

For your custom functions be sure to stay in your namespace.

To continue with example above we'll create the *queryChanged* function. For input plugins these functions often will submit the query to the environment. 

```
sparqplug.in.*.queryChanged = function () {
	var query = $("#query_box").val();
	environment.performQuery(query);
}
```

### Events

If you're creating a detail plugin and you need to know when a query was performed you can bind to an event. This will call your callback function every time the event is triggered. Current global events are:

- *performedQuery* is called whenever results come back. Same time as updateUI.
- *selectedObject* is called whenever a plugin triggers it and includes the object in the data parameter. (out.table does)

`environment.bindToEvent('performQuery',this.updateHistory);`

You can also register your own events if your suite of plugins wants to communicate additional information. Just be sure to register the event in the plugins *.load* function if that plugin relies on it.

`environment.registerEvent('performQuery');`

## Naming Conventions

As with other frameworks names are on a first come first serve bases and the internet is the only regulatory device. The convention for naming the files is sparqplug.in.\*.{js,css} or sparqplug.out.\*.{js,css}.

If you are creating a suite of plugins for a specific dataset please use a second namespace. For Example the Homer Multi-Text uses sparqplug.in.**hmt**.\*.{js,css} for their suite of specific plugins.

