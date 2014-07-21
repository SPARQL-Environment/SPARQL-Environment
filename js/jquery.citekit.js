//version 0.1 ~ Copied June 2nd
(function( $ ) {
	
	var js_url = ''; //Default public JS folder
 
    $.fn.ckLoad = function(options) {
 	   	var opts = $.extend( {}, $.fn.ckLoad.defaults, options);
        $.fn.ckLoad.defaults = opts;
		
		$.fn.ckLoad.assignIDs(this);
 	   	$.fn.ckLoad.fixLinks(this);
		$.fn.ckLoad.fixImages(this);
		
		$.fn.ckLoad.loadBlockquotes(this);
		
		$.fn.ckLoad.fixCompare(this);
		
    };
	
	$.fn.ckDisplayServiceInfo = function () {
		
		var dataOk = true;
		
		// TO-DO validation that data really is okay.
		
		// Log current data to console
		var defaults = $.fn.ckLoad.defaults;
		var message = "<strong>Services</strong><br/>";
		for (i in defaults.sources){
			message = message + i + " : " + JSON.stringify(defaults.sources[i]);
			message = message + "<br/>";
		}
		
		for (i in defaults.sources){
				message = message + "Collection-service " + i + " uses Image-service " + defaults.sources[i]["cite-img"] + "<br/>";
		}
		for (i in defaults.sources){
				message = message + "Collection-service " + i + " links to Collection-service " + defaults.sources[i]["cite-collection"] + "<br/>";
		}

		message = message + "<strong>Default Source: " + defaults.source + "</strong><br/>";
		
		$(this).html(message);
		//citekit_log("Data loaded: " + dataOk);
		return dataOk;
	};
	
	$.fn.ckLoadBlockquote = function () {
		var classNames = $.fn.ckLoad.defaults.classNames;
		var xsltParams = {};
		if (!$(this).hasClass("citekit-complete")) { 
			$(this).addClass("citekit-waiting");
		}
		// prepare params for xslt, if any
		if ( $(this).hasClass( classNames["cite"])){ 
			xsltParams = getCollectionParams(this);
		}
		if ( $(this).hasClass( classNames["citeimg"])){ 
			//console.log("Getting params for id: " + $(this).attr("id"));
			xsltParams = getImageParams(this);
		}
		thisURLString = $(this).ckGetURLString();
		if (thisURLString.substring(0,7) == "http://"){
			pathToXSLT = getXSLTString(this);
			loadXMLDoc( thisURLString, pathToXSLT, this, xsltParams);
		} else {
			$(this).append(" (service not found for this URN)");
			$(this).removeClass("citekit-waiting");
		}
	}
	
	$.fn.ckGetURLString = function () {
		var thisURN = "";
		var thisType = "";
		var thisService = "";
		var thisString = "";
		
		var classNames = $.fn.ckLoad.defaults.classNames;
		
		// identify the type of link
	    for ( whichClass in classNames ){
			if (this.hasClass(classNames[whichClass])) {
				thisType = whichClass;
			}
		}

		// Get the plain URN from the attribute
		if (this.attr("src")) {
			thisURN = this.attr("src");
		} else if ( this.attr("cite")) {
			thisURN = this.attr("cite");
		} else if ( this.attr("href")) {
			thisURN = this.attr("href");
		}
		
		var sources = $.fn.ckLoad.defaults.sources;
		
		//If a service is specified, grab that URL-string
		for (whichService in sources){
			if (this.hasClass(whichService) ){
				switch (thisType) {
					case "cts":
						thisString = sources[whichService]["cite-text"] + $.fn.ckLoad.defaults.getPassagePlus;
						break;
					case "citeimg":
						thisString = sources[whichService]["cite-img"] + $.fn.ckLoad.defaults.getImagePlus;
						break;
					case "cite":
						thisString = sources[whichService]["cite-collection"] + $.fn.ckLoad.defaults.getObjectPlus;
						break;
				}
			}
		}

		//Otherwise, grab the default URL-string
		if ( thisString == ""){ 
			switch (thisType) {
				case "cts":
					thisString = sources[$.fn.ckLoad.defaults.source]["cite-text"] + $.fn.ckLoad.defaults.getPassagePlus;
					break;
				case "citeimg":
					thisString = sources[$.fn.ckLoad.defaults.source]["cite-img"] + $.fn.ckLoad.defaults.getImagePlus;
					break;
				case "cite":
					thisString = sources[$.fn.ckLoad.defaults.source]["cite-collection"] + $.fn.ckLoad.defaults.getObjectPlus;
					break;
			}
		}

		//Assemble and return
		return thisString + thisURN;
	}
	
	$.fn.ckLoadInfiniteScrollingCSV = function(csvFileURL,options) {
		$.ajax({
		  url: csvFileURL,
		  context: this
		}).done(function( returnData ) {
		    var csvData = $.csv.toArrays(returnData);
			$(this).data('ckCSVData',csvData);
			$(this).data('ckCurrentLoadedData',0);
			$(this).append('<blockquote class="'+csvData[0][0]+'" cite="'+csvData[0][1]+'">'+csvData[0][1]+'</blockquote>');
			var opts = $.extend( {}, $.fn.ckLoadInfiniteScrollingCSV.defaults, options);
			this.ckLoad(opts);
			$(this).data('triggerTop',-1);
			$(this).scroll(function(){
				var wintop = $(this).scrollTop();
				var docheight = this.scrollHeight;
				var winheight = $(this).height();
				var  scrolltrigger = $.fn.ckLoadInfiniteScrollingCSV.defaults.scrollTrigger;
				
				var numLoadingBlockquotes = 0;
				$(this).children().each(function(index,elm){
					if ($(elm).hasClass("citekit-waiting")) {
						numLoadingBlockquotes++;
					}
				});

				if  ((wintop/(docheight-winheight)) > scrolltrigger && numLoadingBlockquotes == 0) {
					var csvData = $(this).data('ckCSVData');
					var currentLoadedData = $(this).data('ckCurrentLoadedData')+1;
					if (currentLoadedData < csvData.length) {
						$(this).data('ckCurrentLoadedData',currentLoadedData);
						console.log("Load next data line: "+currentLoadedData);
						$.fn.ckLoadInfiniteScrollingCSV.appendData(this,csvData[currentLoadedData]);
					} else {
						console.log("Reached end of data");
					}
				}
			});
		  });		
	}
	
	$.fn.ckLoadInfiniteScrollingCSV.appendData = function (elm,data) {
		$(elm).append('<blockquote class="'+data[0]+'" cite="'+data[1]+'">'+data[1]+'</blockquote>');
		$(elm).ckLoad();
	}
	
	$.fn.ckLoad.loadBlockquotes = function (elm) {
		var classNames = $.fn.ckLoad.defaults.classNames;
		
		for (whichClass in classNames) {
			var thisURLString = "";
			var className = classNames[whichClass];
			var jqString = elm.selector + " blockquote." + className;
			var xsltParams = {};	

			$( jqString ).each(function(index){
				$(this).ckLoadBlockquote();
				/*$(this).addClass("citekit-waiting");
				// prepare params for xslt, if any
				if ( $(this).hasClass( classNames["cite"])){ 
					xsltParams = getCollectionParams(this);
				}
				if ( $(this).hasClass( classNames["citeimg"])){ 
					//console.log("Getting params for id: " + $(this).attr("id"));
					xsltParams = getImageParams(this);
				}
				thisURLString = $(this).ckGetURLString();
				if (thisURLString.substring(0,7) == "http://"){
					pathToXSLT = getXSLTString(this);
					loadXMLDoc( thisURLString, pathToXSLT, this, xsltParams);
				} else {
					$(this).append(" (service not found for this URN)");
					$(this).removeClass("citekit-waiting");
				}*/
			});
		}
	}
	
	function loadXMLDoc (url, xsl, elm, xsltParams) {
		var ctsResponse;
		var xmlhttp = new XMLHttpRequest();  
		xmlhttp.timeout = 120000;
		xmlhttp.open("GET", url, true);
		xmlhttp.onreadystatechange = function() {  
			if(xmlhttp.readyState == 4) {
			  if (xmlhttp.status == 200){
					  ctsResponse = xmlhttp.responseXML; 
					  loadXSLT(ctsResponse, xsl, elm, xsltParams);
			  } else {
					 blockquoteError(elm,url);
			  }
			}
		}; 	
		xmlhttp.send(null);  
	}
	
	function loadXSLT (ctsResponse, xsl, elm, xsltParams) {
		var myURL = xsl;
	
		var xslhttp = new XMLHttpRequest();  
		xslhttp.open("GET", xsl, true);
		xslhttp.send('');  
	
		xslhttp.onreadystatechange = function() {  
			if(xslhttp.readyState == 4) {
			  xsltData = xslhttp.responseXML;   		
			  processXML(ctsResponse, xsltData,elm, xsltParams);
	  		}	
		}; 
	}
	
	function processXML (ctsResponse, xsltData, elm, xsltParams) {
		var processor = null;
		var tempData = null;
		var tempHTML = "";

		var temp_gbi = xsltParams["imageService"] + $.fn.ckLoad.defaults.getBinaryImage;
		var temp_gip = xsltParams["imageService"] + $.fn.ckLoad.defaults.getImagePlus;
		var temp_gpp = xsltParams["ctsService"] + $.fn.ckLoad.defaults.getPassagePlus;
		var temp_gop = xsltParams["collectionService"] + $.fn.ckLoad.defaults.getObjectPlus;
		var temp_ict = xsltParams["ict"];

		processor = new XSLTProcessor();

		if ( (xsltParams["imageService"] != undefined) && (xsltParams["imageService"] != "" )) {
			processor.setParameter(null,'ImageServiceGIP',temp_gip);
		}
		if ( (xsltParams["imageService"] != undefined) && (xsltParams["imageService"] != "" )) {
			processor.setParameter(null,'ImageServiceThumb',temp_gbi);
		}
		if ( (xsltParams["image-w"] != undefined) && (xsltParams["image-w"] != "" )) {
			//console.log("Setting image-w param " + xsltParams["image-w"] );
			processor.setParameter(null,'image-w',xsltParams["image-w"]);
		}
		if ( (xsltParams["ctsService"] != undefined) && (xsltParams["ctsService"] != "" )) {
			processor.setParameter(null,'TextServiceGPP',temp_gpp);
		}
		if ( (xsltParams["collectionService"] != undefined) && (xsltParams["collectionService"] != "" )) {
			processor.setParameter(null,'CollectionServiceGOP',temp_gop);
		}
		if ( (xsltParams["ict"] != undefined) && (xsltParams["ict"] != "" )) {
			processor.setParameter(null,'ict-url',temp_ict);
		}

		processor.importStylesheet(xsltData);
		tempData = processor.transformToDocument(ctsResponse);
		tempHTML = new XMLSerializer().serializeToString(tempData);	
		putTextOntoPage(tempHTML,elm);
		
	}
	
	function putTextOntoPage (htmlText,elm) {
		$(elm).html(htmlText);
		$(elm).removeClass("citekit-waiting");
		// Catch any Markdown fields
		//citekit_processMarkdown(elemId); TO-DO coming back to this
		if ($.fn.ckLoad.defaults.maps) {
			$.fn.ckLoad.defaults.maps.ckLoadLocations(elm);
		}
		
		$(elm).addClass("citekit-complete");
	}
	
	function blockquoteError (elm, url) {
		var message = "";
		message += "<span class='citekit-error'>Error loading ";
		message += $(elm).attr("cite") + " from URL <code>";
		message += url + "</code>.</span>";
		$(elm).html(message);
		$(elm).removeClass("citekit-waiting");
	}
	
	$.fn.ckLoad.assignIDs = function (elm) {
		var classNames = $.fn.ckLoad.defaults.classNames;
		for ( whichClass in classNames){
			var className = classNames[whichClass];
			$(elm.selector+' blockquote.' + className).each(function(index){
				$(this).attr("id",className + index + "blockquote");
			});
			$(elm.selector+' img.' + className).each(function(index){
				$(this).attr("id",className + index + "img");
			});
			$(elm.selector+' a.' + className).each(function(index){
				$(this).attr("id",className + index + "link");
			});
		}
	};
	$.fn.ckLoad.fixLinks = function (elm) {
		//citekit_log( "Fixing links..." );
		var classNames = $.fn.ckLoad.defaults.classNames;
		for (whichClass in classNames){
			var className = classNames[whichClass];
			var jqString = elm.selector+" a." + className;
			$( jqString ).each(function(index){
				if ( $(this).attr("href").substring(0,7) != "http://" ){
					var thisURLString = $(this).ckGetURLString();
					if (thisURLString.substring(0,7) != "http://"){
						$(this).append(" (service not found for this URN)");
					} else {
						$(this).attr("href", thisURLString);
					}
				}
			});
		}
	};
	$.fn.ckLoad.fixImages = function (elm) {
		jqString = elm.selector+" img." + $.fn.ckLoad.defaults.classNames.citeimg;
		$( jqString ).each(function(index){
			//citekit_log( $(this).attr("src"));
			var urnString = $(this).attr("src");
			var classString = $(this).attr("class");
			var idString = $(this).attr("id");
			var altString = $(this).attr("alt");
			$(this).replaceWith("<blockquote class='" + classString + "' cite='" + urnString + "' id='" + idString + "' alt='" + altString + "'>" + urnString + "</blockquote>");
		});
	};
	
	$.fn.ckLoad.fixCompare = function (elm) {
		$(elm.selector+" div.citekit-compare").each(function(index){
			var howManyKids = $(this).children("blockquote").length;
			var newWidth = Math.round(90 / howManyKids);
			newWidth = Math.round( newWidth - (newWidth / 10));
			$(this).children().each(function(index){
				$(this).css("max-width", (newWidth - 10) + "%");
			});
		});
	}
		
	function getImageParams (obj) {
		var thisSource = $.fn.ckLoad.defaults.source; //starts with default
		var thisPath = "";
		var thisICT = "";
		var returnValue = {};
		//If a service is specified, grab that URL-string
		var sources = $.fn.ckLoad.defaults.sources;
		
		for (whichSource in sources){
			if ($(obj).hasClass(whichSource) ){
				thisSource = whichSource;
			}
		}
		
		//Strip off "image" from image-service URL"
		thisPath = sources[thisSource]['cite-img'].substr(0, sources[thisSource]['cite-img'].indexOf('/image')); //this isn't very portable
		thisICT = thisPath + "/" +  $.fn.ckLoad.defaults.citekit_var_qs_ICT;
		returnValue["ict"] = thisICT;
		
		returnValue["image-w"] = sources[$.fn.ckLoad.defaults.source]['image-w'];
		console.log( $(obj) + " :: source=" + thisSource + " :: citekit_image_w=" + returnValue['image-w']);
		//console.log ("Returning width = " + returnValue["image-w"]);
		
		return returnValue;
	}
	
	function getCollectionParams(obj) {
		var thisSource = $.fn.ckLoad.defaults.source;
		var thisImgSvc = "";
		var thisCollSvc = "";
		var thisCtsSvc = "";
		var returnValue = {};

		// Get service ID
		//If a service is specified, grab that URL-string
		var sources = $.fn.ckLoad.defaults.sources;
		for (whichSource in sources){
			if ($(obj).hasClass(whichSource) ){
				thisSource = whichSource;
			}
		}
		/*
		 * functionality removed. Select image services based on sources. 
		 * Create specific sources for specific image services. If this
		 * is not the proper way please create an issue. Seems redundant.
		
		//Get any assigned image service
		for (whichImgService in citekit_var_services){
			if ( $("#" + whichImgService).hasClass( citekit_var_classNames["citeimg"])){
				if ( $("#" + thisService).hasClass(whichImgService)  ){
					thisImgSvc = whichImgService;
				}
			}
		}

		//Get any assigned text service
		for (whichCtsService in citekit_var_services){
			if ( $("#" + whichCtsService).hasClass( citekit_var_classNames["cts"])){
				if ( $("#" + thisService).hasClass(whichCtsService)  ){
					thisCtsSvc = whichCtsService;
				}
			}
		}

		//Get any assigned collection service
		for (whichCollService in citekit_var_services){
			if ( $("#" + whichCollService).hasClass( citekit_var_classNames["cite"])){
				if ( $("#" + thisService).hasClass(whichCollService)  ){
					thisCollSvc = whichCollService;
				}
			}
		}
		
		if (thisImgSvc == ""){ thisImgSvc = citekit_var_default_img; }
		if (thisCtsSvc == ""){ thisCtsSvc = citekit_var_default_cts; }
		if (thisCollSvc == ""){ thisCollSvc = citekit_var_default_coll; }
		
		*/
		
	    returnValue["image-w"] = sources[thisSource]['image-w'];
        returnValue["imageService"] = thisSource;
		returnValue["collectionService"] = thisSource;
		returnValue["ctsService"] = thisSource;
		return returnValue;
	}
	
	function getXSLTString(obj) {
		var thisType = "";
		var thisString = "";
		// identify the type of link
		var classNames = $.fn.ckLoad.defaults.classNames;
	    for ( whichClass in classNames){
			if ($(obj).hasClass(classNames[whichClass])) {
				thisType = whichClass;
			}
		}
		switch (thisType){
			case "cts":
				thisString = $.fn.ckLoad.defaults.pathTextXslt;
				break;
			case "citeimg":
				thisString = $.fn.ckLoad.defaults.pathImgXslt;
				break;
			case "cite":
				thisString = $.fn.ckLoad.defaults.pathCollXslt;
				break;
		}
		return thisString;
	}
	
	// Plugin defaults
	$.fn.ckLoad.defaults = {
		"source":"svc-folio-cts", //Defualt source to use out of the sources
		"sources":{
			"svc-folio-cts":{//Folio Server at Furman: citeservlet
				"cite-img":"http://folio.furman.edu/citeservlet/images",
				"cite-text":"http://folio.furman.edu/citeservlet/texts",
				"cite-collection":"http://folio.furman.edu/citeservlet/collections",
				"image-w":"500"
			},
			"svc-beta-cts":{//Beta Server in Houston: citeservlet 
				"cite-text":"http://beta.hpcc.uh.edu/tomcat/hmtdigital/texts",
				"cite-img":"http://beta.hpcc.uh.edu/tomcat/hmtdigital/images",
				"cite-collection":"http://beta.hpcc.uh.edu/tomcat/hmtdigital/collections",
				"image-w":"500"
			}
		},	
		"classNames":{
			"cts":"cite-text",
			"citeimg":"cite-image",
			"cite":"cite-collection"
		},
		"getPassagePlus":"?request=GetPassagePlus&urn=",
		"getObjectPlus":"?request=GetObjectPlus&urn=",
		"getImagePlus":"?request=GetImagePlus&urn=",
		"getBinaryImage":"?request=GetBinaryImage&urn=",
		"qsICT":"ict.html?urn=",
		"pathTextXslt":"http://folio.dyndns-web.com/citekit/xslt/citekit-gp.xsl",
		"pathImgXslt":"http://folio.dyndns-web.com/citekit/xslt/citekit-gip.xsl",
		"pathCollXslt":"http://folio.dyndns-web.com/citekit/xslt/xslt/citekit-coll.xsl",
		"maps":false
	};
	
	$.fn.ckLoadInfiniteScrollingCSV.defaults = {
		"scrollTrigger":0.8
	}
 
}( jQuery ));


/* 
 * jQuery-csv a plugin used in the infiniteScrolling
 * MIT License
 * https://code.google.com/p/jquery-csv/
 */


RegExp.escape=function(s){return s.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');};(function($){'use strict'
$.csv={defaults:{separator:',',delimiter:'"',headers:true},hooks:{castToScalar:function(value,state){var hasDot=/\./;if(isNaN(value)){return value;}else{if(hasDot.test(value)){return parseFloat(value);}else{var integer=parseInt(value);if(isNaN(integer)){return null;}else{return integer;}}}}},parsers:{parse:function(csv,options){var separator=options.separator;var delimiter=options.delimiter;if(!options.state.rowNum){options.state.rowNum=1;}
if(!options.state.colNum){options.state.colNum=1;}
var data=[];var entry=[];var state=0;var value=''
var exit=false;function endOfEntry(){state=0;value='';if(options.start&&options.state.rowNum<options.start){entry=[];options.state.rowNum++;options.state.colNum=1;return;}
if(options.onParseEntry===undefined){data.push(entry);}else{var hookVal=options.onParseEntry(entry,options.state);if(hookVal!==false){data.push(hookVal);}}
entry=[];if(options.end&&options.state.rowNum>=options.end){exit=true;}
options.state.rowNum++;options.state.colNum=1;}
function endOfValue(){if(options.onParseValue===undefined){entry.push(value);}else{var hook=options.onParseValue(value,options.state);if(hook!==false){entry.push(hook);}}
value='';state=0;options.state.colNum++;}
var escSeparator=RegExp.escape(separator);var escDelimiter=RegExp.escape(delimiter);var match=/(D|S|\n|\r|[^DS\r\n]+)/;var matchSrc=match.source;matchSrc=matchSrc.replace(/S/g,escSeparator);matchSrc=matchSrc.replace(/D/g,escDelimiter);match=RegExp(matchSrc,'gm');csv.replace(match,function(m0){if(exit){return;}
switch(state){case 0:if(m0===separator){value+='';endOfValue();break;}
if(m0===delimiter){state=1;break;}
if(m0==='\n'){endOfValue();endOfEntry();break;}
if(/^\r$/.test(m0)){break;}
value+=m0;state=3;break;case 1:if(m0===delimiter){state=2;break;}
value+=m0;state=1;break;case 2:if(m0===delimiter){value+=m0;state=1;break;}
if(m0===separator){endOfValue();break;}
if(m0==='\n'){endOfValue();endOfEntry();break;}
if(/^\r$/.test(m0)){break;}
throw new Error('CSVDataError: Illegal State [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');case 3:if(m0===separator){endOfValue();break;}
if(m0==='\n'){endOfValue();endOfEntry();break;}
if(/^\r$/.test(m0)){break;}
if(m0===delimiter){throw new Error('CSVDataError: Illegal Quote [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');}
throw new Error('CSVDataError: Illegal Data [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');default:throw new Error('CSVDataError: Unknown State [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');}});if(entry.length!==0){endOfValue();endOfEntry();}
return data;},splitLines:function(csv,options){var separator=options.separator;var delimiter=options.delimiter;if(!options.state.rowNum){options.state.rowNum=1;}
var entries=[];var state=0;var entry='';var exit=false;function endOfLine(){state=0;if(options.start&&options.state.rowNum<options.start){entry='';options.state.rowNum++;return;}
if(options.onParseEntry===undefined){entries.push(entry);}else{var hookVal=options.onParseEntry(entry,options.state);if(hookVal!==false){entries.push(hookVal);}}
entry='';if(options.end&&options.state.rowNum>=options.end){exit=true;}
options.state.rowNum++;}
var escSeparator=RegExp.escape(separator);var escDelimiter=RegExp.escape(delimiter);var match=/(D|S|\n|\r|[^DS\r\n]+)/;var matchSrc=match.source;matchSrc=matchSrc.replace(/S/g,escSeparator);matchSrc=matchSrc.replace(/D/g,escDelimiter);match=RegExp(matchSrc,'gm');csv.replace(match,function(m0){if(exit){return;}
switch(state){case 0:if(m0===separator){entry+=m0;state=0;break;}
if(m0===delimiter){entry+=m0;state=1;break;}
if(m0==='\n'){endOfLine();break;}
if(/^\r$/.test(m0)){break;}
entry+=m0;state=3;break;case 1:if(m0===delimiter){entry+=m0;state=2;break;}
entry+=m0;state=1;break;case 2:var prevChar=entry.substr(entry.length-1);if(m0===delimiter&&prevChar===delimiter){entry+=m0;state=1;break;}
if(m0===separator){entry+=m0;state=0;break;}
if(m0==='\n'){endOfLine();break;}
if(m0==='\r'){break;}
throw new Error('CSVDataError: Illegal state [Row:'+options.state.rowNum+']');case 3:if(m0===separator){entry+=m0;state=0;break;}
if(m0==='\n'){endOfLine();break;}
if(m0==='\r'){break;}
if(m0===delimiter){throw new Error('CSVDataError: Illegal quote [Row:'+options.state.rowNum+']');}
throw new Error('CSVDataError: Illegal state [Row:'+options.state.rowNum+']');default:throw new Error('CSVDataError: Unknown state [Row:'+options.state.rowNum+']');}});if(entry!==''){endOfLine();}
return entries;},parseEntry:function(csv,options){var separator=options.separator;var delimiter=options.delimiter;if(!options.state.rowNum){options.state.rowNum=1;}
if(!options.state.colNum){options.state.colNum=1;}
var entry=[];var state=0;var value='';function endOfValue(){if(options.onParseValue===undefined){entry.push(value);}else{var hook=options.onParseValue(value,options.state);if(hook!==false){entry.push(hook);}}
value='';state=0;options.state.colNum++;}
if(!options.match){var escSeparator=RegExp.escape(separator);var escDelimiter=RegExp.escape(delimiter);var match=/(D|S|\n|\r|[^DS\r\n]+)/;var matchSrc=match.source;matchSrc=matchSrc.replace(/S/g,escSeparator);matchSrc=matchSrc.replace(/D/g,escDelimiter);options.match=RegExp(matchSrc,'gm');}
csv.replace(options.match,function(m0){switch(state){case 0:if(m0===separator){value+='';endOfValue();break;}
if(m0===delimiter){state=1;break;}
if(m0==='\n'||m0==='\r'){break;}
value+=m0;state=3;break;case 1:if(m0===delimiter){state=2;break;}
value+=m0;state=1;break;case 2:if(m0===delimiter){value+=m0;state=1;break;}
if(m0===separator){endOfValue();break;}
if(m0==='\n'||m0==='\r'){break;}
throw new Error('CSVDataError: Illegal State [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');case 3:if(m0===separator){endOfValue();break;}
if(m0==='\n'||m0==='\r'){break;}
if(m0===delimiter){throw new Error('CSVDataError: Illegal Quote [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');}
throw new Error('CSVDataError: Illegal Data [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');default:throw new Error('CSVDataError: Unknown State [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');}});endOfValue();return entry;}},toArray:function(csv,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;var state=(options.state!==undefined?options.state:{});var options={delimiter:config.delimiter,separator:config.separator,onParseEntry:options.onParseEntry,onParseValue:options.onParseValue,state:state}
var entry=$.csv.parsers.parseEntry(csv,options);if(!config.callback){return entry;}else{config.callback('',entry);}},toArrays:function(csv,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;var data=[];var options={delimiter:config.delimiter,separator:config.separator,onParseEntry:options.onParseEntry,onParseValue:options.onParseValue,start:options.start,end:options.end,state:{rowNum:1,colNum:1}};data=$.csv.parsers.parse(csv,options);if(!config.callback){return data;}else{config.callback('',data);}},toObjects:function(csv,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;config.headers='headers'in options?options.headers:$.csv.defaults.headers;options.start='start'in options?options.start:1;if(config.headers){options.start++;}
if(options.end&&config.headers){options.end++;}
var lines=[];var data=[];var options={delimiter:config.delimiter,separator:config.separator,onParseEntry:options.onParseEntry,onParseValue:options.onParseValue,start:options.start,end:options.end,state:{rowNum:1,colNum:1},match:false};var headerOptions={delimiter:config.delimiter,separator:config.separator,start:1,end:1,state:{rowNum:1,colNum:1}}
var headerLine=$.csv.parsers.splitLines(csv,headerOptions);var headers=$.csv.toArray(headerLine[0],options);var lines=$.csv.parsers.splitLines(csv,options);options.state.colNum=1;if(headers){options.state.rowNum=2;}else{options.state.rowNum=1;}
for(var i=0,len=lines.length;i<len;i++){var entry=$.csv.toArray(lines[i],options);var object={};for(var j in headers){object[headers[j]]=entry[j];}
data.push(object);options.state.rowNum++;}
if(!config.callback){return data;}else{config.callback('',data);}},fromArrays:function(arrays,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;config.escaper='escaper'in options?options.escaper:$.csv.defaults.escaper;config.experimental='experimental'in options?options.experimental:false;if(!config.experimental){throw new Error('not implemented');}
var output=[];for(i in arrays){output.push(arrays[i]);}
if(!config.callback){return output;}else{config.callback('',output);}},fromObjects2CSV:function(objects,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;config.experimental='experimental'in options?options.experimental:false;if(!config.experimental){throw new Error('not implemented');}
var output=[];for(i in objects){output.push(arrays[i]);}
if(!config.callback){return output;}else{config.callback('',output);}}};$.csvEntry2Array=$.csv.toArray;$.csv2Array=$.csv.toArrays;$.csv2Dictionary=$.csv.toObjects;})(jQuery);