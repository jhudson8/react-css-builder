  
  // main cache of style definitions
  var vars;
  var mixins = {};
  var styles = { global: {} };

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
  var getStyleSet = function(path, optionalNamespace) {
    var paths = path.split('.');
    if (optionalNamespace) {
      paths.splice(0, 0, optionalNamespace);
    }
    var rtn = _getStyleSetFromBase(paths, 0, styles);
    if (!rtn) {
      if (optionalNamespace) {
        paths.splice(0, 1);
        rtn = _getStyleSetFromBase(paths, 0, styles);
      }
      if (!rtn) {
        throw new Error('Unknown style path "' + path + '"');
      }
    }
    if (!_isFunction(rtn)) {
      throw new Error('style path is not a valid styleset "' + path + '"');
    }
    return rtn;
  };

  // recurse function used with getStyleSet
  var _getStyleSetFromBase = function(parts, index, base) {
    var part = parts[index],
        rtn = base[part] || (index === 0 && base.global[part]);
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
  function normalizeStyles(styles, base, namespace) {
    for (var key in styles) {
      if (styles.hasOwnProperty(key)) {
        base[key] = normalizeStyleAttributes(styles[key], namespace);
      }
    }
  }

  /**
   * Normalize the styleset attributes when registering stylesets.
   * Recurse function for normalizeStyles
   */
  function normalizeStyleAttributes(styleset, namespace) {
    var name;
    if (_isFunction(styleset)) {
      return function(vars) {
        return styleset(new StyleContext(vars, namespace), vars);
      };
    }

    if (styleset.attributes) {
      // has nesting
      var rtn = normalizeStyleAttributes(styleset.attributes);
      for (name in styleset) {
        if (styleset.hasOwnProperty(name) && name !== 'attributes') {
          rtn[name] = normalizeStyleAttributes(styleset[name], namespace);
        }
      }
      return rtn;
    } else {
      if (_isDeep(styleset)) {
        // nesting container
        for (name in styleset) {
          if (styleset.hasOwnProperty(name)) {
            styleset[name] = normalizeStyleAttributes(styleset[name], namespace);
          }
        }
        return styleset;
      } else {
        // simple attributes
        return function() { return styleset; };
      }
    }
  }


  var rtn = {
    _reset: function() {
      vars = {};
      styles = { global: {} };
    },

    // return an object with function calls for each named style
    register: function(namespace, _styles) {
      if (!_styles) {
        _styles = namespace;
        namespace = 'global';
      }
      if (_isFunction(_styles)) {
        _styles = _styles(rtn);
      }

      var base = styles[namespace];
      if (!base) {
        base = styles[namespace] = {};
      }

      normalizeStyles(_styles, base, namespace === 'global' ? undefined : namespace);
    },

    mixin: function(name, mixin) {
      mixins[name] = mixin;
      return this;
    },

    css: function(paths) {
      return new StyleSelector(paths).css();
    },

    get: function(paths) {
      return new StyleSelector(paths);
    },

    vars: function(_vars) {
      vars = vars || {};
      _extend(vars, _vars);
      return this;
    }
  };


  /**
   * Class used as the return response from calling "css" on exports.
   * Allows for chained commands to be completed by the "val" method
   * to return the final styleset values.
   */
  var StyleSelector = function(paths) {
    this.paths = normalizePaths(paths);
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
      var _vars = this._vars;
      if (vars) {
        if (_vars) {
          _extend(_vars, vars);
        } else {
          _vars = vars;
        }
      }

      if (this.paths.length === 1 && !this.attrs) {
        return getStyleSet(this.paths[0])(_vars);
      }

      var attrs = {};
      for (var i=0; i<this.paths.length; i++) {
        _extend(attrs, getStyleSet(this.paths[i])(this, this.vars));
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
  var StyleContext = function(vars, namespace) {
    this.vars = vars;
    this.namespace = namespace;
    this.attrs = {};
  };
  _extend(StyleContext.prototype, {
    include: function(path) {
      _extend(this.attrs, getStyleSet(path, this.namespace)(vars));
      return this;
    },
    mixin: function(name) {
      var args = Array.prototype.slice.call(arguments, 1),
          mixin = mixins[name];
      if (!mixin) {
        throw new Error('Unknown mixin "' + name + '"');
      }
      _extend(this.attrs, mixin.apply(this.vars, args));
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

  module.exports = rtn;
