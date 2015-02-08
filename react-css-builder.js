  // utility / helper functions

  // iterate the attributes of an object
  function _each(obj, callback) {
    for (var name in obj) {
      if (obj.hasOwnProperty(name)) {
        callback(obj[name], name);
      }
    }
  }

  // extend the attributes of src into target
  function  _extend(target, src) {
    if (src) {
      _each(src, function(value, name) {
        target[name] = value;
      });
    }
    return target;
  }

  // return true if obj is a function
  function _isFunction(obj) {
    return typeof obj === 'function';
  }

  // return true if obj is a string
  function _isString(obj) {
    return typeof obj === 'string';
  }

  // create and return the class
  function _createClass(constructor, attributes) {
    _extend(constructor.prototype, attributes);
    return constructor;
  }

  /**
   * Return a style set function that should be executed as
   * function(vars)
   */
  var getStyleSet = function(path, builder) {
    var paths = path.split('.'),
        optionalBuilder = paths.length > 1 && builders[paths[0]],
        rtn;

    rtn = _getStyleSetFromBase(paths, 0, builder._styles);
    if (!rtn && optionalBuilder) {
      // try a namespace
      paths.splice(0, 1);
      rtn = _getStyleSetFromBase(paths, 0, optionalBuilder._styles);
    }

    if (!rtn) {
      throw new Error('Unknown style path "' + path + '"');
    }
    if (!_isFunction(rtn)) {
      throw new Error('style path is not a valid styleset "' + path + '"');
    }

    return rtn;
  };

  // recurse function used with getStyleSet
  var _getStyleSetFromBase = function(parts, index, base) {
    var part = parts[index],
        rtn = base[part];
    if (!rtn) {
      return;
    }
    var nextIndex = index + 1;
    if (nextIndex >= parts.length) {
      return rtn;
    } else {
      return _getStyleSetFromBase(parts, nextIndex, rtn);
    }
  };


  /**
   * Normalize all stylesheet definitions
   * - styles: the user provided stylesheet
   * - builder: the associated Builder
   */
  function normalizeStyles(styles, builder) {
    _each(styles, function(style, key) {
      builder._styles[key] = normalizeStyleAttributes(style, builder);
    });
  }

  /**
   * Normalize the styleset attributes when registering stylesets.
   * Recurse function for normalizeStyles
   * - styleset: the style attributes for a particular style class
   * - builder: the associated Builder
   */
  function normalizeStyleAttributes(styleset, builder) {
    var name;
    if (_isFunction(styleset)) {
      // user provided function so we need to give them the css context to work with
      return function(varRetriever) {
        return styleset.call(varRetriever, new StyleContext(varRetriever, builder));
      };
    }

    var attr = styleset.attributes;
    if (attr) {
      // any nesting parent *must* include the "attributes" value
      var rtn = normalizeStyleAttributes(attr);
      _each(styleset, function(attr, name) {
        if (name !== 'attributes') {
          rtn[name] = normalizeStyleAttributes(attr, builder);
        }
      });
      return rtn;
    } else {
      // simple attributes
      return function() { return styleset; };
    }
  }


  /**
   * The object returned when calling require('react-css-builder').register('...')
   */
  var Builder = _createClass(function(parent) {
    this._vars = {};
    this._mixins = {};
    this._styles = {};
    this.parent = parent;
  }, {

    // return
    css: function(paths) {
      return new StyleSelector(paths, this).css();
    },

    get: function(paths) {
      return new StyleSelector(paths, this);
    },

    mixin: function(name, mixin) {
      if (!mixin) {
        return this._mixins[name] || (this.parent && this.parent.mixin(name));
      }

      this._mixins[name] = mixin;
      return this;
    },

    vars: function(vars) {
      if (_isString(vars)) {
        return this._vars[vars] || (this.parent && this.parent.vars(vars));
      }

      _extend(this._vars, vars);
      return this;
    }
  });


  /**
   * Class used as the return response from calling "css" on exports.
   * Allows for chained commands to be completed by the "val" method
   * to return the final styleset values.
   */
  var StyleSelector = _createClass(function(path, builder) {
    this.paths = normalizePaths(path);
    this.builder = builder;
    var self = this;
    this.varRetriever = {
      get: function(key) {
        return (self._vars && self._vars[key]) || self.builder.vars(key);
      }
    };
  }, {
    attr: function(attrs) {
      this._attrs = _attrs;
      return this;
    },
    vars: function(vars) {
      this._vars = vars;
      return this;
    },
    css: function() {
      if (this.paths.length === 1 && !this.attrs) {
        return getStyleSet(this.paths[0], this.builder)(this.varRetriever);
      }

      var attrs = {};
      for (var i=0; i<this.paths.length; i++) {
        _.extend(attrs, getStyleSet(this.paths[i], this.builder)(this.varRetriever));
      }
      _.extend(attrs, this._attrs);
      return attrs;
    }
  });

  var pathCache = {},
      nestingMatchPattern = /[^\s,]+\s*\[[^\]]+\]/g,
      nestingChildPattern = /^([^\[\s]+)\s*\[([^\]]+)/;

  /**
   * Normalize the css selector path
   * multiple classes can be included and separated with whitespace or comma
   * multiple nested classes have a shorthand of parent[child1 child2 ...] (children separated with space or comma)
   * For example foo, a[b c] d[e,f], bar = ['foo', 'a.b', 'a.c', 'd.e', 'd.f', 'bar']
   */
  function normalizePaths(path) {
    var rtn = pathCache[path];
    if (!rtn) {
      var result = path.replace(nestingMatchPattern, function(val) {
        var match = val.match(nestingChildPattern),
            parts = match[2].split(/[\s,]+/g),
            rtn = '';
        for (var i=0; i<parts.length; i++) {
          rtn += (' ' + match[1] + '.' + parts[i]);
        }
        return rtn; 
      });
      rtn = pathCache[path] = result.split(/[,\s]+/g);
    }
    return rtn;
  }


  /**
   * The style context object provided to styleset functions
   */
  var StyleContext = _createClass(function(varRetriever, builder) {
    this.varRetriever = varRetriever;
    this.builder = builder;
    this.attrs = {};
  }, {
    include: function(path) {
      _extend(this.attrs, getStyleSet(path, this.builder)(this.varRetriever));
      return this;
    },
    mixin: function(name) {
      var args = Array.prototype.slice.call(arguments, 1),
          mixin = this.builder.mixin(name);
      if (!mixin) {
        throw new Error('Unknown mixin "' + name + '"');
      }
      _extend(this.attrs, mixin.apply(this.varRetriever, args));
      return this;
    },
    css: function(attr) {
      return _extend(this.attrs, attr);
    }
  });


  // global cache
  var builders = {},
      main = new Builder();

  // wrapper function to ensure the context is the main Builder
  function mainFunc(name) {
    return function() {
      main[name].apply(main, arguments);
    };
  }

  module.exports = {
    create: function(namespace, _styles) {
      if (!_styles) {
        _styles = namespace;
        namespace = undefined;
      }

      var builder = namespace && builders[namespace];
      if (!builder) {
        builder = new Builder(main);
        if (namespace) {
          builder.namespace = namespace;
          builders[namespace] = builder;
        }
      }

      normalizeStyles(_styles, builder);
      return builder;
    },

    vars: mainFunc('vars'),
    mixin: mainFunc('mixin')
  };
