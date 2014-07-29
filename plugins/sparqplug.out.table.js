sparqplug.out.table = {type:"out","title":"Table Viewer","description":"View results in a table.","icon":"&#xf0ce;","css":"sparqplug.out.table.css"};

sparqplug.out.table.load = function () {

}

sparqplug.out.table.updateUI = function () {
	$('#sparqplug-out-table').empty();
	
	var table = $('<table/>');
	
	var keys = Object.keys(environment.latestResults[0]);
	
	$.each(environment.latestResults,function (index, row) {
		var tr = $('<tr/>');
		
		$.each(row,function (key, values) {
			td = $('<td />',{
				text: $(document).resolvePrefix(values.value)
			}).data('obj',values.value).click(function () {
				environment.triggerEvent('selectedObject',{'object':$(this).data('obj')});
				//environment.detailObject($(this).data('obj'));
			});
			tr.append(td);
		});
		
		table.append(tr);
	});	
	
	var th = $('<tr/>');
	
	$.each(keys, function (index, key) {
		th.append('<th>'+key+'</th>');
	});
	
	table.prepend(th);
	
	$('#sparqplug-out-table').append(table);
}

plugins['sparqplug-out-table'] = sparqplug.out.table;
