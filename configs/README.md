# Configs

### Learn by Example

```
{
	"name":"example-fufolio", // Plain text name for your dataset. Should be as unique as possible.
	"description":"An example of a dataset using Furman's HMT Project.", // Plain text description of what your dataset contains.
	"source":"http://folio.furman.edu/fuseki/folio/query", // SPARQL endpoint
	"prefixes":{
		"cts:":"http://www.homermultitext.org/cts/rdf/", // Prefixes used. Key : Value
		"cite:":"http://www.homermultitext.org/cite/rdf/",
		"rdf:":"http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	},
	"variables":{ // (In-Development) Variables commenly used with your data.
		"?folio":{
			
		},"?image":{
			
		}
	},
	"plugins":["sparqplug-in-text","sparqplug-out-json","sparqplug-out-table"] // Plugins which should be loaded.
}
```

### Keep in Mind

- Currently plugins are not "downloaded" when a config file is imported. Please inform your users which plugins they will need to download and from where.
- SPARQL Endpoints must be the exact URL from which you can add "?query=SELECT..." if you have fancy mapping or other url redirects, please take that into account.
- Prefixes need to include the colon.

### In the Future

We would like to create a database of config files and plugins from which users can peruse. If you are an early adopter (and if you're reading this you are) we would love it if you'd check back here to stay up to date.