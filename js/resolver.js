environment.resolver = {
  libraryFile:'library.json',
  library:null,
  resolved:{

  }
};


/**
 * Gets the contents of the library property or if they do not exist gets them from the library file.
 */

environment.resolver.getLibrary = function() {
  if (this.library == null) {
    this.library = $.ajax({
      url: "library.json",
      async: false,
      dataType:'json'
    });
  }
  return this.library;
}

environment.resolver.resolvePluginURN = function (urn,callback) {
  this.resolved[urn] = {
    status:'loading',
    loaded:0,
    total: this.getLibrary()[urn].count,
    success:true,
    loadedResource:function (url) {
      this.loaded++;
      if (this.loaded == total) {
        this.status = 'loaded';
        this.callbackFunction(success);
      }
    },
    callbackFunction:callback
  }
  that = this;
  $.each(this.getLibrary()[urn],function(index, url) {
    var re = /(?:\.([^.]+))?$/;
    var extension = re.exec(url)[1];
    if (extension == "js") {
      $.getScript(url, function( data, textStatus, jqxhr ) {
    		console.log('Loaded JS for Plugin: '+urn);
        that.resolved[urn].loadedResource(url);
      });
    } else if (extension == "css") {
      $('<link/>', {
         rel: 'stylesheet',
         type: 'text/css',
         href: url
      }).appendTo('head');
      that.resolved[urn].loadedResource(url);
    } else {
      console.log('Failed to load resource (unrecognized extension): '+url);
      that.resolved[urn].loadedResource(url);
      that.resolved[urn].success = false;
    }
  });
}
