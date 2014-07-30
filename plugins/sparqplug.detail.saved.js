sparqplug.detail.saved = {type:"detail","title":"Saved","description":"View save and tag queries.","icon":"&#xf1da;","css":"sparqplug.detail.saved.css"};

sparqplug.detail.saved.load = function () {
	$('#sparqplug-detail-saved').append("<input type='text' placeholder='tags' />");
	$('#sparqplug-detail-saved').append("<ul></ul>");
	
	// Load Initally saved queries.
	
	$.each(this.getSavedQueries, function (index, query_object) {
		var li = sparqplug.detail.saved.liForSavedQuery(query_object);
		$('#sparqplug-detail-saved ul').append(li);
	});
}



sparqplug.detail.saved.getSavedQueries = function () {
	return environment.config[this.currentDataset].saved;
}

sparqplug.detail.saved.liForSavedQuery = function(query_object) {
	li = $("<li/>",{
				text: query
			}).click(function(){
				query = this.innerHTML;
				environment.performQuery(query);
			});
			return li;
}

plugins['sparqplug-detail-history'] = sparqplug.detail.history;