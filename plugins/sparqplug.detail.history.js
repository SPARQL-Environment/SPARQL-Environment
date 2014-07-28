sparqplug.detail.history = {type:"detail","title":"History","description":"View query history.","icon":"&#xf121;","css":"sparqplug.out.json.css"};

sparqplug.detail.history.load = function () {
	$('#sparqplug-detail-history').append("<h3>Test History</h3>");
	$('#sparqplug-detail-history').append("<ul></ul>")
}

sparqplug.detail.history.updateUI = function () {
	$.each(environment.config[environment.currentDataset].history, function (index, value) {
		$("#sparqplug-detail-history ul").prepend(this.createHistoryli(value,index));
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