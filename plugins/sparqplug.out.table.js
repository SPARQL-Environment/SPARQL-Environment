sparqplug.out.table = {type:"out","title":"Table Viewer","description":"View results in a table.","icon":"&#xf0ce;","css":"sparqplug.out.table.css"};
plugins['urn:sparqplug:sparqlenvironment.out.table:0.1'] = sparqplug.out.table;

sparqplug.out.table.load = function (selector) {
	$(selector).addClass('sparqplug-out-table');
}

sparqplug.out.table.updateUI = function (selector) {
	$(selector).empty();

	var commonKeys = {};

	var resultCount = 0;

	$.each(environment.latestResults,function (panelIndex, panelResults) {
		$.each(panelResults,function (resultIndex, resultObject) {
			var table = $('<table/>',{
				id:'sparql-out-table-'+resultCount
			});

			var keys = Object.keys(resultObject.results[0]);
			var comparingKeys = {};

			for (var index in keys) {
				var key = keys[index];
				if (commonKeys[key]) {
					comparingKeys[key] = commonKeys[keys[index]].length;
					commonKeys[key].push([]);
				} else {
					comparingKeys[key] = 0;
					commonKeys[key] = [[]];
				}
			}

			var dataset = environment.getDatasetObject(resultObject.dataset);
			$.each(resultObject.results,function (index, row) {
				// Start Row
				var tr = $('<tr/>');
				$.each(row,function (key, values) {
					td = $('<td />',{
						text: $.resolvePrefix(values.value,dataset)
					}).data('obj',values.value).click(function () {
						environment.triggerEvent('selectedObject',{'object':values.value});
						//environment.detailObject($(this).data('obj'));
					});

					if (comparingKeys[key] != 0) { // Has other result sets to compare to.
						var addedToResultSets = []; // List of result sets
						for (var resultSetIndex = 0; resultSetIndex < comparingKeys[key]; resultSetIndex ++) { // iterate through result sets with key
							var index = commonKeys[key][resultSetIndex].binaryIndexOf(values.value);
							if (index < 0) {
								console.log('Addition '+key+' '+values.value+' index: '+index+' in resultSet '+resultSetIndex);
								addedToResultSets.push(resultSetIndex);
							}
						}

						if (addedToResultSets.length > 0) {
							td.data('addedTo',addedToResultSets);
							td.attr('title','Added compared to: '+addedToResultSets.join(' ,'));
							td.addClass('addition addition-'+addedToResultSets.length);
						}
					}

					// Add to it's own result set.
					var index = commonKeys[key][comparingKeys[key]].binaryIndexOf(values.value);
					if (index < 0) {
						commonKeys[key][comparingKeys[key]].splice(Math.abs(index)-1, 0, values.value);
					} else {
						// Duplicate in same result set
					}
					// Each Column

					tr.append(td);
				});
				table.append(tr);
			});
			var th = $('<tr/>');
			$.each(keys, function (index, key) {
				th.append('<th>'+key+'</th>');
			});
			table.prepend(th);
			var th = $('<tr/>',{
				'html':'<th colspan="'+keys.length+'">Result Set #'+resultCount+'</th>'
			});
			table.prepend(th);
			$(selector).append(table);

			resultCount++;
		});
	});

	$('.addition').bind('mouseOver',function () {

	});
	$(selector).removeClass('addition-levels-2 addition-levels-3 addition-levels-4 addition-levels-5');
	$(selector).addClass('addition-levels-'+resultCount);
}

/**
 * Performs a binary search on the host array. This method can either be
 * injected into Array.prototype or called with a specified scope like this:
 * binaryIndexOf.call(someArray, searchElement);
 *
 * @param {*} searchElement The item to search for within the array.
 * @return {Number} The index of the element which defaults to -1 when not found.
 */
function binaryIndexOf(searchElement) {
	'use strict';

	var minIndex = 0;
	var maxIndex = this.length - 1;
	var currentIndex;
	var currentElement;
	var resultIndex;

	while (minIndex <= maxIndex) {
		resultIndex = currentIndex = (minIndex + maxIndex) / 2 | 0;
		currentElement = this[currentIndex];

		if (currentElement < searchElement) {
			minIndex = currentIndex + 1;
		} else if (currentElement > searchElement) {
			maxIndex = currentIndex - 1;
		} else {
			return currentIndex;
		}
	}
	if (minIndex > currentIndex) {
		return ~minIndex;
	} else if(maxIndex > currentIndex)  {
		return ~maxIndex;
	}
	return ~currentIndex;
}

Array.prototype.binaryIndexOf = binaryIndexOf;
/*var arr = [0, 1, 2, 4, 5, 6, 6.5, 7, 8, 9];
arr.splice(Math.abs(arr.binaryIndexOf(3)), 0, 3);
document.body.textContent = JSON.stringify(arr);*/
