sparqplug.in.text = {type:"in","title":"Text Query","description":"Standard SPARQL query environment.","icon":"&#xf040;","css":"sparqplug.in.text.css"};

sparqplug.in.text.load = function () {
	var textarea = $('<textarea />',{
		id: 'sp-in-text-textarea'
	});//.change(sparqplug.in.text.queryChanged);
	
	$("#sparqplug-in-text").append(textarea);
	
	var elements = {"SELECT":{'complete-before':'SELECT ','complete-after':'','class':'kw-main'},"LIMIT":{'complete-before':'LIMIT ','complete-after':'','class':'kw-main'},"WHERE":{'complete-before':'WHERE { \n  ','complete-after':'\n}','class':'kw-main'},"DISTINCT":{'class':'kw-submain','complete-before':'DISTINCT ','complete-after':''},"FILTER":{'complete-before':'FILTER ( ','complete-after':' )','class':'kw-main'},"FILTER-REGEX":{'complete-before':'FILTER regex( ','complete-after':' )','class':'kw-main'}}
	var terms = ["BASE","SELECT","ORDER BY","FROM","GRAPH","STR","isURI","PREFIX","CONSTRUCT","LIMIT","FROM NAMED","OPTIONAL","LANG","isIRI","DESCRIBE","OFFSET","WHERE","UNION","LANGMATCHES","isLITERAL","ASK","DISTINCT","FILTER","FILTER-REGEX","DATATYPE","REGEX","REDUCED","a","BOUND","true","sameTERM","false"];
	
	var variables = ["?subject","?verb","?object"];
	var prefixes = Object.keys(environment.currentConfig.prefixes);
	
	$('#sp-in-text-textarea').textcomplete([
		{ // Prefixes
	        match: /(?:^|\s)(\w+)$/im,
	        search: function (term, callback) {
	            callback($.map(prefixes, function (element) {
	                return element.indexOf(term) === 0 ? element : null;
	            }));
	        },
	        index: 0,
	        replace: function (element) {
				$('#sp-in-text-textarea').overlay().data('overlay').addTermAndColor(element,'prefix');
				return element;
	        },
			 header: "Prefixes"
		},
	    { // Keywords
	        match: /(?:^|\s)(\w+)$/im ,
	        search: function (term, callback) {
	            callback($.map(terms, function (element) {
	                return element.indexOf(term.toUpperCase()) === 0 ? element : null;
	            }));
	        },
	        index: 0,
	        replace: function (element) {
				if (elements[element]) {
	            	return [elements[element]['complete-before'], elements[element]['complete-after']];
				} else {
					return element + " ";
				}
	        },
			 header: "Keywords"
		},{ // Variables
	        match: /(\?\w*)$/im ,
	        search: function (term, callback) {
	            callback($.map(variables, function (element) {
	                return element.indexOf(term) === 0 ? element : null;
	            }));
	        },
	        index: 0,
	        replace: function (element) {
				$('#sp-in-text-textarea').overlay().data('overlay').addTermAndColor(element,'verb');
				return element + " ";
	        },
			 header: "Variables"
		}
	]);
	
	$.each(variables, function(index, value) {
		$('#sp-in-text-textarea').overlay().data('overlay').addTermAndColor(value,'verb');
	});
	$.each(prefixes, function(index, value) {
		$('#sp-in-text-textarea').overlay().data('overlay').addTermAndColor(value,'prefix');
	});
	$.each(elements, function(key, value) {
		$('#sp-in-text-textarea').overlay().data('overlay').addTermAndColor(key,value.class);
	});
	$('#sp-in-text-textarea').data('alting',false);
	$('#sp-in-text-textarea').keydown(function(e) {
		console.log('keydown : '+e.keyCode);
		if (e.keyCode == 18) {
			$(this).data('alting',true);
		} else if ($(this).data('alting') == true && e.keyCode == 13) { //R?
			sparqplug.in.text.queryChanged();
		}
	});
	$('#sp-in-text-textarea').keyup(function(e) {
		if (e.keyCode == 18) {
			$(this).data('alting',false);
		}
	});
	
	var run_button = $('<a />',{
		id: 'sp-in-text-run',
		class:'icons'
	}).append("&#xf04b;").click(function () {sparqplug.in.text.queryChanged()});
	
	$('#sp-in-text-textarea').parent().append(run_button);
	
	//self.loadDetailView();
}

sparqplug.in.text.error = function (error) {
	//alert('There was an Error!');
}

sparqplug.in.text.updateUI = function () {
	console.log("updateUI in.text");
	$('#sp-in-text-textarea').val(environment.latestQuery);
	$('#sp-in-text-textarea').trigger('change');
}

//Plugin Specific

sparqplug.in.text.queryChanged = function () {
	var query = $('#sp-in-text-textarea').val();
	environment.performQuery(query);
}

sparqplug.in.text.loadDetailView = function () {
	/*$('#detail.content').empty();
	var verb_search = $('<input/>',{
		type:'text'
	}).change(function () {
		var urn = $(this).val();
		
		environment.silentQuery("SELECT distinct ?v WHERE { <"+urn+"> ?v ?o }")
		
		$('#detail-verb-search-results').append();
	})
	
	$('#detail.content').append(verb_search);*/
}

plugins['sparqplug-in-text'] = sparqplug.in.text;

/*!
 * jQuery.textoverlay.js
 *
 * Repository: https://github.com/yuku-t/jquery-textoverlay
 * License:    MIT
 * Author:     Yuku Takahashi
 */

;(function ($) {

  'use strict';

  /**
   * Get the styles of any element from property names.
   */
  var getStyles = (function () {
    var color;
    color = $('<div></div>').css(['color']).color;
    if (typeof color !== 'undefined') {
      return function ($el, properties) {
        return $el.css(properties);
      };
    } else {  // for jQuery 1.8 or below
      return function ($el, properties) {
        var styles;
        styles = {};
        $.each(properties, function (i, property) {
          styles[property] = $el.css(property);
        });
        return styles
      };
    }
  })();

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }

  var entityRegexe = /[&<>"'\/]/g

  /**
   * Function for escaping strings to HTML interpolation.
   */
  var escape = function (str) {
    return str.replace(entityRegexe, function (match) {
      return entityMap[match];
    })
  };

  /**
   * Determine if the array contains a given value.
   */
  var include = function (array, value) {
    var i, l;
    if (array.indexOf) return array.indexOf(value) != -1;
    for (i = 0, l = array.length; i < l; i++) {
      if (array[i] === value) return true;
    }
    return false;
  };

  var Overlay = (function () {

    var html, css, textareaToWrapper, textareaToOverlay, allowedProps, termsAndColors;

    html = {
      wrapper: '<div class="textoverlay-wrapper"></div>',
      overlay: '<div class="textoverlay"></div>'
    };

    css = {
      wrapper: {
        
      },
      overlay: {
        
      },
      textarea: {
        
      }
    };

    // CSS properties transport from textarea to wrapper
    textareaToWrapper = [];
    // CSS properties transport from textarea to overlay
    textareaToOverlay = [
    ];

    function Overlay($textarea) {
      var $wrapper, position;

      // Setup wrapper element
      position = $textarea.css('position');
      if (position === 'static') position = 'relative';
      $wrapper = $(html.wrapper);

      // Setup overlay
      this.textareaTop = parseInt($textarea.css('border-top-width'));
      this.$el = $(html.overlay);

      // Setup textarea
      this.$textarea = $textarea.css(css.textarea);

      // Render wrapper and overlay
      this.$textarea.wrap($wrapper).after(this.$el);

      // Intercept val method
      // Note that jQuery.fn.val does not trigger any event.
      this.$textarea.origVal = $textarea.val;
      this.$textarea.val = $.proxy(this.val, this);

      // Bind event handlers
      this.$textarea.on({
        'input.overlay':  $.proxy(this.onInput,       this),
        'change.overlay': $.proxy(this.onInput,       this),
        'scroll.overlay': $.proxy(this.resizeOverlay, this),
        'resize.overlay': $.proxy(this.resizeOverlay, this)
      });

      this.strategies = [];

	  this.termsAndColors = {};

    }

    $.extend(Overlay.prototype, {
      val: function (value) {
        return value == null ? this.$textarea.origVal() : this.setVal(value);
      },

      setVal: function (value) {
        this.$textarea.origVal(value);
        this.renderTextOnOverlay();
        return this.$textarea;
      },

      onInput: function (e) {
        this.renderTextOnOverlay();
      },

      renderTextOnOverlay: function () {
        var text, i, l, strategy, match, style;
        text = escape(this.$textarea.val());

		$.each(this.termsAndColors, function (term, color) {
			console.log('Change: '+term+' '+color);
			var match;
			if (term.indexOf('?') == 0) {
				 match = new RegExp('(\\'+term+')','g');
			} else {
				 match = new RegExp('('+term+')','g');
			}
			text = text.replace(match,"<span class='"+color+"'>"+term+"</span>");
		});

        // Apply all strategies
        /*for (i = 0, l = this.strategies.length; i < l; i++) {
          strategy = this.strategies[i];
          match = strategy.match;
          if ($.isArray(match)) {
            match = $.map(match, function (str) {
              return str.replace(/(\(|\)|\|)/g, '\$1');
            });
            match = new RegExp('(' + match.join('|') + ')', 'g');
          }

          text = text.replace(match, function (str) {
            return '<span class="'+ strategy.class+'">' + str + '</span>';
          });
        }*/
        this.$el.html(text);
        return this;
      },

      resizeOverlay: function () {
        this.$el.css({ top: this.textareaTop - this.$textarea.scrollTop() });
      },

      register: function (strategies) {
        strategies = $.isArray(strategies) ? strategies : [strategies];
        this.strategies = this.strategies.concat(strategies);
        return this.renderTextOnOverlay();
      },

	  addTermAndColor: function (term, color) {
		  if (color == "verb") {
			  if (!this.termsAndColors[term]) {
				  //verb set color
				  var verb_num = 0;

				  while (this.containsColor(color + "-" +verb_num) == true) {
					  verb_num++;
				  }
				  console.log('Add '+term+" withColor "+color+"-"+verb_num);
				  color = color + "-" + verb_num;
		  		} else {
		  			return this;
		  		}
		  }
		  this.termsAndColors[term] = color;
		  return this;
	  },

	  containsColor: function (color_final) {
		  var contained = false;
		  $.each(this.termsAndColors,function (term, color) {
		  					  if (color == color_final) {
		  						  contained = true;
		  					  }
		  				  });

						  return contained;
	  } ,

      destroy: function () {
        var $wrapper;
        this.$textarea.off('.overlay');
        $wrapper = this.$textarea.parent();
        $wrapper.after(this.$textarea).remove();
        this.$textarea.data('overlay', void 0);
        this.$textarea = null;
      }
    });

    return Overlay;

  })();

  $.fn.overlay = function (strategies) {
    var dataKey;
    dataKey = 'overlay';

    if (strategies === 'destroy') {
      return this.each(function () {
        var overlay = $(this).data(dataKey);
        if (overlay) { overlay.destroy(); }
      });
    }

    return this.each(function () {
      var $this, overlay;
      $this = $(this);
      overlay = $this.data(dataKey);
      if (!overlay) {
        overlay = new Overlay($this);
        $this.data(dataKey, overlay);
      }
      overlay.register(strategies);
    });
  };

})(window.jQuery);

/*!
 * jQuery.textcomplete.js
 *
 * Repositiory: https://github.com/yuku-t/jquery-textcomplete
 * License:     MIT
 * Author:      Yuku Takahashi
 */
RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

;(function ($) {

  'use strict';

  /**
   * Exclusive execution control utility.
   */
  var lock = function (func) {
    var free, locked, queuedArgsToReplay;
    free = function () { locked = false; };
    return function () {
      var args = toArray(arguments);
      if (locked) {
        // Keep a copy of this argument list to replay later.
        // OK to overwrite a previous value because we only replay the last one.
        queuedArgsToReplay = args;
        return;
      }
      locked = true;
      var that = this;
      args.unshift(function replayOrFree() {
        if (queuedArgsToReplay) {
          // Other request(s) arrived while we were locked.
          // Now that the lock is becoming available, replay
          // the latest such request, then call back here to
          // unlock (or replay another request that arrived
          // while this one was in flight).
          var replayArgs = queuedArgsToReplay;
          queuedArgsToReplay = undefined;
          replayArgs.unshift(replayOrFree);
          func.apply(that, replayArgs);
        } else {
          locked = false;
        }
      });
      func.apply(this, args);
    };
  };

  /**
   * Convert arguments into a real array.
   */
  var toArray = function (args) {
    var result;
    result = Array.prototype.slice.call(args);
    return result;
  };

  /**
   * Get the styles of any element from property names.
   */
  var getStyles = (function () {
    var color;
    color = $('<div></div>').css(['color']).color;
    if (typeof color !== 'undefined') {
      return function ($el, properties) {
        return $el.css(properties);
      };
    } else {  // for jQuery 1.8 or below
      return function ($el, properties) {
        var styles;
        styles = {};
        $.each(properties, function (i, property) {
          styles[property] = $el.css(property);
        });
        return styles;
      };
    }
  })();

  /**
   * Default template function.
   */
  var identity = function (obj) { return obj; };

  /**
   * Memoize a search function.
   */
  var memoize = function (func) {
    var memo = {};
    return function (term, callback) {
      if (memo[term]) {
        callback(memo[term]);
      } else {
        func.call(this, term, function (data) {
          memo[term] = (memo[term] || []).concat(data);
          callback.apply(null, arguments);
        });
      }
    };
  };

  /**
   * Determine if the array contains a given value.
   */
  var include = function (array, value) {
    var i, l;
    if (array.indexOf) return array.indexOf(value) != -1;
    for (i = 0, l = array.length; i < l; i++) {
      if (array[i] === value) return true;
    }
    return false;
  };

  /**
   * Textarea manager class.
   */
  var Completer = (function () {
    var html, css, $baseList, _id;

    html = {
      list: '<ul class="dropdown-menu"></ul>'
    };
    css = {
      // Removed the 'top' property to support the placement: 'top' option
      list: {
        position: 'absolute',
        left: 0,
        zIndex: '100',
        display: 'none'
      }
    };
    $baseList = $(html.list).css(css.list);
    _id = 0;

    function Completer($el, option) {
      var focus;
      this.el = $el.get(0);  // textarea element
      focus = this.el === document.activeElement;
      this.$el = $el;
      this.id = 'textComplete' + _id++;
      this.strategies = [];
      this.option = option;
      if (focus) {
        this.initialize();
        this.$el.focus();
      } else {
        this.$el.one('focus.textComplete', $.proxy(this.initialize, this));
      }
    }

    /**
     * Completer's public methods
     */
    $.extend(Completer.prototype, {

      /**
       * Prepare ListView and bind events.
       */
      initialize: function () {
        var $list, globalEvents, appendTo;
        $list = $baseList.clone();
        this.listView = new ListView($list, this);
        this.$el.on({
          'keyup.textComplete': $.proxy(this.onKeyup, this),
          'keydown.textComplete': $.proxy(this.listView.onKeydown, this.listView)
        });
        appendTo = this.option.appendTo;
        if (appendTo) {
          // Append ListView to specified element.
          $list.appendTo(appendTo instanceof $ ? appendTo : $(appendTo));
        } else {
          $list.appendTo($('body'));
        }
        globalEvents = {};
        globalEvents['click.' + this.id] = $.proxy(this.onClickDocument, this);
        globalEvents['keyup.' + this.id] = $.proxy(this.onKeyupDocument, this);
        $(document).on(globalEvents);
      },

      /**
       * Register strategies to the completer.
       */
      register: function (strategies) {
        this.strategies = this.strategies.concat(strategies);
      },

      /**
       * Show autocomplete list next to the caret.
       */
      renderList: function (data) {
        if (this.clearAtNext) {
          this.listView.clear();
          this.clearAtNext = false;
        }
        if (data.length) {
          this.listView.strategy = this.strategy;
          if (!this.listView.shown) {
            this.listView
                .setPosition(this.getCaretPosition())
                .clear()
                .activate();
          }
          data = data.slice(0, this.strategy.maxCount);
          this.listView.render(data);
        }

        if (!this.listView.data.length && this.listView.shown) {
          this.listView.deactivate();
        }
      },

      searchCallbackFactory: function (free) {
        var self = this;
        return function (data, keep) {
          self.renderList(data);
          if (!keep) {
            // This is the last callback for this search.
            free();
          }
        };
      },

      /**
       * Keyup event handler.
       */
      onKeyup: function (e) {
        var searchQuery, term;
        if (this.skipSearch(e)) { return; }

        searchQuery = this.extractSearchQuery(this.getTextFromHeadToCaret());
        if (searchQuery.length) {
          term = searchQuery[0];
          if (this.term === term) return; // Ignore shift-key or something.
          this.term = term;
          this.search(searchQuery);
        } else {
          this.term = null;
          this.listView.deactivate();
        }
      },

      /**
       * Suppress searching if it returns true.
       */
      skipSearch: function (e) {
        switch (e.keyCode) {
          case 40: // DOWN
          case 38: // UP
            return true;
        }
        if (e.ctrlKey) switch (e.keyCode) {
          case 78: // Ctrl-N
          case 80: // Ctrl-P
            return true;
        }
      },
	  
      onSelect: function (data_obj) {
        var pre, post, newSubStr, sel, range, selection, match, value;
		value = data_obj['val'];
		this.strategy = data_obj['strategy'];
        pre = this.getTextFromHeadToCaret();

        if (this.el.contentEditable == 'true') {
          sel = window.getSelection();
          range = sel.getRangeAt(0);
          selection = range.cloneRange();
          selection.selectNodeContents(range.startContainer);
          var content = selection.toString();
          post = content.substring(range.startOffset);
        } else {
          post = this.el.value.substring(this.el.selectionEnd);
        }
        
        newSubStr = this.strategy.replace(value);
        
        if ($.isArray(newSubStr)) {
          post = newSubStr[1] + post;
          newSubStr = newSubStr[0];
        }

       	match = this.getMatch(pre, this.strategy.match, this.strategy.index);
		
		if (this.strategy.match_replace) {
			pre = pre.replace(this.strategy.match_replace, newSubStr);
		} else {
			pre = pre.replace(new RegExp(RegExp.escape(match)+"$"), newSubStr);
		}
       
        
        if (this.el.contentEditable == 'true') {
          range.selectNodeContents(range.startContainer);
          range.deleteContents();
          var node = document.createTextNode(pre + post);
          range.insertNode(node);
          range.setStart(node, pre.length);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          this.$el.val(pre + post);
          this.el.selectionStart = this.el.selectionEnd = pre.length; 
        }

        this.$el.trigger('change')
                .trigger('textComplete:select', value);
        this.el.focus();
      },

      /**
       * Global click event handler.
       */
      onClickDocument: function (e) {
        if (e.originalEvent && !e.originalEvent.keepTextCompleteDropdown) {
          this.listView.deactivate();
        }
      },

      /**
       * Global keyup event handler.
       */
      onKeyupDocument: function (e) {
        if (this.listView.shown && e.keyCode === 27) { // ESC
          this.listView.deactivate();
          this.$el.focus();
        }
      },

      /**
       * Remove all event handlers.
       */
      destroy: function () {
        this.$el.off('.textComplete');
        $(document).off('.' + this.id);
        if (this.listView) { this.listView.destroy(); }
        this.$el.data('textComplete', void 0);
        this.$el = null;
      },

      // Helper methods
      // ==============

      getCaretPosition: function () {
        var caretPosition, textareaOffset;
        caretPosition = this.getCaretRelativePosition();
        textareaOffset = this.$el.offset();
        caretPosition.top += textareaOffset.top;
        caretPosition.left += textareaOffset.left;
        return caretPosition;
      },

      /**
       * Returns caret's relative coordinates from textarea's left top corner.
       */
      getCaretRelativePosition: function () {
        var properties, css, $div, $span, position, dir, scrollbar, range, node, $node;
        if (this.el.contentEditable != 'true') {
          // Browser native API does not provide the way to know the position of
          // caret in pixels, so that here we use a kind of hack to accomplish
          // the aim. First of all it puts a div element and completely copies
          // the textarea's style to the element, then it inserts the text and a
          // span element into the textarea.
          // Consequently, the span element's position is the thing what we want.
          properties = ['border-width', 'font-family', 'font-size', 'font-style',
            'font-variant', 'font-weight', 'height', 'letter-spacing',
            'word-spacing', 'line-height', 'text-decoration', 'text-align',
            'width', 'padding-top', 'padding-right', 'padding-bottom',
            'padding-left', 'margin-top', 'margin-right', 'margin-bottom',
            'margin-left', 'border-style', 'box-sizing'
          ];
          scrollbar = this.$el[0].scrollHeight > this.$el[0].offsetHeight;
          css = $.extend({
            position: 'absolute',
            overflow: scrollbar ? 'scroll' : 'auto',
            'white-space': 'pre-wrap',
            top: 0,
            left: -9999,
            direction: dir
          }, getStyles(this.$el, properties));

          $div = $('<div></div>').css(css).text(this.getTextFromHeadToCaret());
          $span = $('<span></span>').text('.').appendTo($div);
          this.$el.before($div);
          position = $span.position();
          position.top += $span.height() - this.$el.scrollTop();
          $div.remove();
        } else {
          range = window.getSelection().getRangeAt(0).cloneRange();
          node = document.createElement('span');
          range.insertNode(node);
          range.selectNodeContents(node);
          range.deleteContents();
          $node = $(node);
          position = $node.offset();
          position.top += $node.height() - this.$el.offset().top;
        }
        dir = this.$el.attr('dir') || this.$el.css('direction');
        if (dir === 'rtl') { position.left -= this.listView.$el.width(); }
        return position;
      },

      getTextFromHeadToCaret: function () {
        var text, selectionEnd, range;
        if (this.el.contentEditable == 'true') {
          if (window.getSelection) {
            // IE9+ and non-IE            
            var range = window.getSelection().getRangeAt(0);
            var selection = range.cloneRange();
            selection.selectNodeContents(range.startContainer);
            text = selection.toString().substring(0, range.startOffset);
          }
        } else {
          selectionEnd = this.el.selectionEnd;
          if (typeof selectionEnd === 'number') {
            text = this.el.value.substring(0, selectionEnd);
          } else if (document.selection) {
            range = this.el.createTextRange();
            range.moveStart('character', 0);
            range.moveEnd('textedit');
            text = range.text;
          }
        }
        return text;
      },

      /**
       * Parse the value of textarea and extract search query.
       */
      extractSearchQuery: function (text) {
        var i, l, strategy, match;
		var strategies = [];
        for (i = 0, l = this.strategies.length; i < l; i++) {
          strategy = this.strategies[i];
          match = this.getMatch(text, strategy.match, strategy.index);
		  
          if (match) {
			  	strategies.push(match);
		  		strategies.push(strategy);
		  }
		  
	  	 }
        return strategies; // 0 - term 1 - strategy... n - term n-1 - strategy
      },
	  
	  getMatch: function(string, regex, index) {
		  if(!(regex instanceof RegExp)) {
	          return "ERROR";
	      }
	      else {
	          if (!regex.global) {
	              // If global flag not set, create new one.
	              var flags = "g";
	              if (regex.ignoreCase) flags += "i";
	              if (regex.multiline) flags += "m";
	              if (regex.sticky) flags += "y";
	              regex = RegExp(regex.source, flags);
	          }
	      }
	      var matches = [];
	      var match = regex.exec(string);
	      while (match) {
	          if (match.length > 2) {
	              var group_matches = [];
	              for (var i = 1; i < match.length; i++) {
	                  group_matches.push(match[i]);
	              }
	              matches.push(group_matches);
	          }
	          else {
	              matches.push(match[1]);
	          }
	          match = regex.exec(string);
	      }
	      return matches[index];
	  },

      search: lock(function (free, searchQuery) {
			for (var i=0; i < searchQuery.length; i+=2) {
				var term;
				this.strategy = searchQuery[i+1];
				term = searchQuery[i];
				this.strategy.search(term, this.searchCallbackFactory(free));
			}
        	this.clearAtNext = true;
      })
    });

    return Completer;
  })();

  /**
   * Dropdown menu manager class.
   */
  var ListView = (function () {

    function ListView($el, completer) {
      this.data = [];
      this.$el = $el;
      this.index = 0;
      this.completer = completer;

      this.$el.on('mousedown.textComplete', 'li.textcomplete-item',
                  $.proxy(this.onClick, this));
    }

    $.extend(ListView.prototype, {
      shown: false,

      render: function (data) {
        var html, i, l, index, val, str;

        html = '';
        
        if(this.strategy.header) {
          if ($.isFunction(this.strategy.header)) {
            str = this.strategy.header(data);
          } else {
            str = this.strategy.header;
          }
          html += '<li class="textcomplete-header">' + str + '</li>';
        }

        for (i = 0, l = data.length; i < l; i++) {
          val = data[i];
          if (include(this.data, val)) continue;
          index = this.data.length;
          this.data.push({'val':val,'strategy':this.strategy});
          html += '<li class="textcomplete-item" data-index="' + index + '"><a>';
          html +=   this.strategy.template(val);
          html += '</a></li>';
          if (this.data.length === this.strategy.maxCount) break;
        }

        if(this.strategy.footer) {
          if ($.isFunction(this.strategy.footer)) {
            str = this.strategy.footer(data);
          } else {
            str = this.strategy.footer;
          }
          html += '<li class="textcomplete-footer">' + str + '</li>';
        }

        this.$el.append(html);
        if (!this.data.length) {
          this.deactivate();
        } else {
          this.activateIndexedItem();
        }
      },

      clear: function () {
        this.data = [];
        this.$el.html('');
        this.index = 0;
        return this;
      },

      activateIndexedItem: function () {
        this.$el.find('.active').removeClass('active');
        this.getActiveItem().addClass('active');
      },

      getActiveItem: function () {
        return $(this.$el.children('.textcomplete-item').get(this.index));
      },

      activate: function () {
        if (!this.shown) {
          this.$el.show();
          this.completer.$el.trigger('textComplete:show');
          this.shown = true;
        }
        return this;
      },

      deactivate: function () {
        if (this.shown) {
          this.$el.hide();
          this.completer.$el.trigger('textComplete:hide');
          this.shown = false;
          this.data = [];
          this.index = null;
        }
        return this;
      },

      setPosition: function (position) {
        var fontSize;
        // If the strategy has the 'placement' option set to 'top', move the
        // position above the element
        if(this.strategy.placement === 'top') {
          // Move it to be in line with the match character
          fontSize = parseInt(this.$el.css('font-size'));
          // Overwrite the position object to set the 'bottom' property instead of the top.
          position = {
            top: 'auto',
            bottom: this.$el.parent().height() - position.top + fontSize,
            left: position.left
          };
        } else {
          // Overwrite 'bottom' property because once `placement: 'top'`
          // strategy is shown, $el keeps the property.
          position.bottom = 'auto';
        }
        this.$el.css(position);
        return this;
      },

      select: function (index) {
        var self = this;
        this.completer.onSelect(this.data[index]);
        // Deactive at next tick to allow other event handlers to know whether
        // the dropdown has been shown or not.
        setTimeout(function () { self.deactivate(); }, 0);
      },

      onKeydown: function (e) {
        if (!this.shown) return;
        if (e.keyCode === 38 || (e.ctrlKey && e.keyCode === 80)) {         // UP, or Ctrl-P
          e.preventDefault();
          if (this.index === 0) {
            this.index = this.data.length-1;
          } else {
            this.index -= 1;
          }
          this.activateIndexedItem();
        } else if (e.keyCode === 40 || (e.ctrlKey && e.keyCode === 78)) {  // DOWN, or Ctrl-N
          e.preventDefault();
          if (this.index === this.data.length - 1) {
            this.index = 0;
          } else {
            this.index += 1;
          }
          this.activateIndexedItem();
        } else if (e.keyCode === 13 || e.keyCode === 9) {  // ENTER or TAB
          e.preventDefault();
          this.select(parseInt(this.getActiveItem().data('index'), 10));
        }
      },

      onClick: function (e) {
        var $e = $(e.target);
        e.preventDefault();
        e.originalEvent.keepTextCompleteDropdown = true;
        if (!$e.hasClass('textcomplete-item')) {
          $e = $e.parents('li.textcomplete-item');
        }
        this.select(parseInt($e.data('index'), 10));
      },

      destroy: function () {
        this.deactivate();
        this.$el.off('click.textComplete').remove();
        this.$el = null;
      }
    });

    return ListView;
  })();

  $.fn.textcomplete = function (strategies, option) {
    var i, l, strategy, dataKey;

    dataKey = 'textComplete';
    option || (option = {});

    if (strategies === 'destroy') {
      return this.each(function () {
        var completer = $(this).data(dataKey);
        if (completer) { completer.destroy(); }
      });
    }

    for (i = 0, l = strategies.length; i < l; i++) {
      strategy = strategies[i];
      if (!strategy.template) {
        strategy.template = identity;
      }
      if (strategy.index == null) {
        strategy.index = 2;
      }
      if (strategy.cache) {
        strategy.search = memoize(strategy.search);
      }
      strategy.maxCount || (strategy.maxCount = 10);
    }

    return this.each(function () {
      var $this, completer;
      $this = $(this);
      completer = $this.data(dataKey);
      if (!completer) {
        completer = new Completer($this, option);
        $this.data(dataKey, completer);
      }
      completer.register(strategies);
    });
  };

})(window.jQuery || window.Zepto);

