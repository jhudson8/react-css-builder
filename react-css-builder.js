  // utility / helper functions

  // extend the attributes of src into target
  function  _extend(target, src) {
    if (src) {
      for (var name in src) {
        if (src.hasOwnProperty(name)) {
          target[name] = src[name];
        }
      }
    }
    return target;
  }

  // return true if obj is a function
  function _isFunction(obj) {
    return typeof obj === 'function';
  }

  function _isDeep(obj) {
    for (var name in obj) {
      if (obj.hasOwnProperty(name)) {
        if (typeof obj[name] === 'object') {
          return true;
        }
      }
    }
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
   */
  function normalizeStyles(styles, builder) {
    for (var key in styles) {
      if (styles.hasOwnProperty(key)) {
        builder._styles[key] = normalizeStyleAttributes(styles[key], builder);
      }
    }
  }

  /**
   * Normalize the styleset attributes when registering stylesets.
   * Recurse function for normalizeStyles
   */
  function normalizeStyleAttributes(styleset, builder) {
    var name;
    if (_isFunction(styleset)) {
      return function(varRetriever) {
        return styleset.call(varRetriever, new StyleContext(varRetriever, builder));
      };
    }

    if (styleset.attributes) {
      // has nesting
      var rtn = normalizeStyleAttributes(styleset.attributes);
      for (name in styleset) {
        if (styleset.hasOwnProperty(name) && name !== 'attributes') {
          rtn[name] = normalizeStyleAttributes(styleset[name], builder);
        }
      }
      return rtn;
    } else {
      if (_isDeep(styleset)) {
        // nesting container
        for (name in styleset) {
          if (styleset.hasOwnProperty(name)) {
            styleset[name] = normalizeStyleAttributes(styleset[name], builder);
          }
        }
        return styleset;
      } else {
        // simple attributes
        return function() { return styleset; };
      }
    }
  }


  var Builder = function(parent) {
    this._vars = {};
    this._mixins = {};
    this._styles = {};
    this.parent = parent;
  };
  _extend(Builder.prototype, {
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
      if (typeof vars === 'string') {
        return this._vars[vars] || (this.parent && this.parent.vars(vars));
      }

      _extend(this._vars, vars);
      return this;
    }
  });


  // globals
  var builders = {},
      main = new Builder();
  function mainFunc(name) {
    return function() {
      main[name].apply(main, arguments);
    };
  }

  var root = {
    register: function(namespace, _styles) {
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

      if (_isFunction(_styles)) {
        _styles = _styles(rtn);
      }
      normalizeStyles(_styles, builder);
      return builder;
    },

    vars: mainFunc('vars'),

    mixin: mainFunc('mixin')
  };

  /**
   * Class used as the return response from calling "css" on exports.
   * Allows for chained commands to be completed by the "val" method
   * to return the final styleset values.
   */
  var StyleSelector = function(paths, builder) {
    this.paths = normalizePaths(paths);
    this.builder = builder;
    var self = this;
    this.varRetriever = {
      get: function(key) {
        return (self._vars && self._vars[key]) || self.builder.vars(key);
      }
    };
  };
  _extend(StyleSelector.prototype, {
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
        return getStyleSet(this.paths[i], this.builder)(this.varRetriever);
      }
      _.extend(attrs, this._attrs);
      return attrs;
    }
  });

  function normalizePaths(paths) {
    return paths && (Array.isArray(paths) ? paths : paths.split(/\s+/));
  }
  

  /**
   * The style context object provided to styleset functions
   */
  var StyleContext = function(varRetriever, builder) {
    this.varRetriever = varRetriever;
    this.builder = builder;
    this.attrs = {};
  };
  _extend(StyleContext.prototype, {
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
    val: function(attr) {
      if (attr) {
        return _extend(this.attrs, attr);
      } else {
        return this.attrs;
      }
      
    }
  });

  module.exports = root;
