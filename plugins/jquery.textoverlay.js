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

		var tokens = text.split(" "); // TO-DO Need a better tokenizer begining of lines with line breaks doesn't work.

		$.each(this.termsAndColors, function (term, color) {
			//console.log('Change: '+term+' '+color);
			var match;
			var token;
			for (var i = 0; i < tokens.length; i++) {
				token = tokens[i];
				if (token == term) {
					tokens[i] = "<span class='"+color+"'>"+term+"</span>";
				}
			}
		});

		text = tokens.join(" ");

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
