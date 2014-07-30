sparqplug.detail.history = {type:"detail","title":"History","description":"View query history.","icon":"&#xf1da;","css":"sparqplug.detail.history.css"};

sparqplug.detail.history.load = function () {
	$('#sparqplug-detail-history').append("<ul></ul>")
	environment.bindToEvent('performedQuery', this.updateHistory );
	this.updateHistory();
	
	// TO-Do Clear History Button
	/*$.btn.click(function () {
		environment.clearHistory();
	});*/
	
}

sparqplug.detail.history.updateHistory = function () {
	$("#sparqplug-detail-history ul").empty();
	$.each(environment.config[environment.currentDataset].history, function (index, value) {
		$("#sparqplug-detail-history ul").prepend(sparqplug.detail.history.createHistoryli(value,index));
	});
}

sparqplug.detail.history.createHistoryli = function (query, index) {
	li = $("<li/>",{
				text: query
			}).click(function(){
				query = this.innerHTML;
				environment.performQuery(query);
			});
			return li;
}

plugins['sparqplug-detail-history'] = sparqplug.detail.history;