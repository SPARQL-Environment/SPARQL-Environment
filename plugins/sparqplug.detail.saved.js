sparqplug.detail.saved = {type:"detail","title":"Saved","description":"View save and tag queries.","icon":"&#xf1da;","css":"sparqplug.detail.history.css"};

sparqplug.detail.history.load = function () {
	$('#sparqplug-detail-history').append("<h3>Test History</h3>");
	$('#sparqplug-detail-history').append("<ul></ul>");
}

sparqplug.detail.history.updateUI = function () {
	$.each(environment.config[environment.currentDataset].history, function (index, value) {
		$("#sparqplug-detail-history ul").prepend(sparqplug.detail.history.createHistoryli(value,index));
	});
}

sparqplug.detail.history.createHistoryli = function (query, index) {
	li = $("<li/>",{
				text: query
			}).data('history-index',index).click(function(){
				query = this.innerHTML;
				environment.loadFromHistory($(this).data('history-index'));
			});
			return li;
}

plugins['sparqplug-detail-history'] = sparqplug.detail.history;