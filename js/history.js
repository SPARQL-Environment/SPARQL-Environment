environment.history = {
  historyConfig:'sparql.history',
  data:[]
};

/**
 * Loads initial data from datasource into local storage. For custom solutions
 * this can be a small subset of the history and then other history can be
 * queried as needed. This function is called in the environments load function.
 */

environment.history.load = function () {

}


/**
 * Gets the contents of the library property or if they do not exist gets them
 * from the library file.
 * @param {range} (from,length) 0 being most recent counting up through the
 * history. Example of last 10 would be (0,10)
 * return array of history items.
 */

environment.history.get = function(range) {
  var response = [];
  for (var i = range[0]; i < self.data.length && i < range[0]+range[1]; i++) {
    response.push(this.data[i]);
  }
  return response;
}

/**
 * Adds the contents of the item to the history storage.
 * @param {query} string The SPARQL query string.
 * @param {dataset} string The unique dataset identifer the query was called on.
 */

environment.history.add = function (query,dataset) {
  this.data.push({
    query:query,
    dataset:dataset
  });
  this.save();
}

environment.history.clear = function () {
	 this.data = [];
   this.save();
}

environment.history.save = function () {
  localStorage.setItem(this.currentViewKey, this.currentView);
}
