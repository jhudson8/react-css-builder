var chai = require('chai'),
    expect = chai.expect,
    css = require('../react-css-builder');

css.vars({
  someVar: 2
});

css.mixin('radius', function(radius) {
  return {
    borderRadius: this.get('radius') || radius
  };
});

var privateTestCss = css.register({
  test1: {
    minWidth: 1
  }
});


var hierarchyTestCss = css.register('foo', {
  bar: {
    height: 10
  }
});

var hierarchyTestCss = css.register('hierarchy', {
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

var callbacksTestCss = css.register('callbacks', {
  base1: {
    border: 1
  },
  base2: function() {
    return {
      minHeight: 1
    };
  },
  test1: function(css) {
    return css.include('base1').val();
  },
  test2: function(css) {
    return css
      .include('base1')
      .include('base2')
      .include('foo.bar')
      .val();
  },
  test3: function(css) {
    return css
      .include('base1')
      .val({
        height: 1,
        width: this.get('someVar')
      });
  },
  test4: function(css) {
    return css
      .mixin('radius', 3)
      .val({
        height: 1
      });
  }
});


describe('react-css-builder', function() {
  it('private namespace', function() {
    expect(privateTestCss.css('test1')).to.eql({minWidth: 1});
  });

  describe('styleset callbacks', function() {
    it('single includes', function() {
      expect(callbacksTestCss.css('test1')).to.eql({
        border: 1
      });
    });

    it('multiple includes', function() {
      expect(callbacksTestCss.css('test2')).to.eql({
        border: 1,
        height: 10,
        minHeight: 1
      });
    });

    it('include with attr', function() {
      expect(callbacksTestCss.css('test3')).to.eql({
        border: 1,
        height: 1,
        width: 2
      });
    });
  });

  describe('mixins', function() {
    it('should use simple mixins', function() {
      expect(callbacksTestCss.css('test4')).to.eql({
        height: 1,
        borderRadius: 3
      });
    });
    it('mixin variable access', function() {
      expect(callbacksTestCss.get('test4').vars({radius: 4}).css()).to.eql({
        height: 1,
        borderRadius: 4
      });
    });
  });

  describe('hierarchy', function() {
    it('should get attributes from parent', function() {
      expect(hierarchyTestCss.css('top.bottom')).to.eql({
        test: 1
      });
    });
    it('should get attributes from child (simple)', function() {
      expect(hierarchyTestCss.css('top.bottom.foo')).to.eql({
        test: 2
      });
    });
    it('should get attributes from child (callback)', function() {
      expect(hierarchyTestCss.css('top.bottom.bar')).to.eql({
        test: 3
      });
    });
  });

});
