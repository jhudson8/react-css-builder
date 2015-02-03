var chai = require('chai'),
    expect = chai.expect,
    css = require('../react-css-builder');

css.vars({
  someVar: 2
});

css.mixin('radius', function(radius) {
  return {
    borderRadius: this.radius || radius
  };
});

css.register({
  globalTest: {
    padding: 1
  }
});

css.register('foo', {
  namespace: {
    minWidth: 1
  }
});


css.register('hierarchy', {
  top: {
    bottom: {
      attributes: {
        test: 1
      },
      foo: {
        test: 2
      },
      bar: function() {
        return {
          test: 3
        };
      }
    }
  }
});

css.register('callbacks', {
  base1: {
    border: 1
  },
  base2: function() {
    return {
      minHeight: 1
    };
  },
  test1: function(css, vars) {
    return css.include('base1').val();
  },
  test2: function(css, vars) {
    return css
      .include('base1')
      .include('base2')
      .include('foo.namespace')
      .val();
  },
  test3: function(css, vars) {
    return css
      .include('base1')
      .val({
        height: 1,
        width: vars.someVar
      });
  },
  test4: function(css, vars) {
    return css
      .mixin('radius', 3)
      .val({
        height: 1
      });
  }
});


describe('react-css-builder', function() {
  it('global namespace', function() {
    expect(css.css('globalTest')).to.eql({padding: 1});
  });

  it('specific namespace', function() {
    expect(css.css('foo.namespace')).to.eql({minWidth: 1});
  });

  describe('styleset callbacks', function() {
    it('single includes', function() {
      expect(css.css('callbacks.test1')).to.eql({
        border: 1
      });
    });

    it('multiple includes', function() {
      expect(css.css('callbacks.test2')).to.eql({
        border: 1,
        minHeight: 1,
        minWidth: 1
      });
    });

    it('include with attr', function() {
      expect(css.css('callbacks.test3')).to.eql({
        border: 1,
        height: 1,
        width: 2
      });
    });
  });

  describe('mixins', function() {
    it('should use simple mixins', function() {
      expect(css.css('callbacks.test4')).to.eql({
        height: 1,
        borderRadius: 3
      });
    });
    it('mixin variable access', function() {
      expect(css.get('callbacks.test4').vars({radius: 4}).css()).to.eql({
        height: 1,
        borderRadius: 4
      });
    });
  });

  describe('hierarchy', function() {
    it('should get attributes from parent', function() {
      expect(css.css('hierarchy.top.bottom')).to.eql({
        test: 1
      });
    });
    it('should get attributes from child (simple)', function() {
      expect(css.css('hierarchy.top.bottom.foo')).to.eql({
        test: 2
      });
    });
    it('should get attributes from child (callback)', function() {
      expect(css.css('hierarchy.top.bottom.bar')).to.eql({
        test: 3
      });
    });
  });

});
