# react-css-builder
CSS builder for creating inline react component style objects

If you want React to do native well, you need to use inline styles.  But, you can still get the DRY and maintainability benefits of an external stylesheet with react-css-builder.

You can create a javascript stylesheet similar to what you would see with a CSS precompiler but you can actually use variablees calculated at runtime!

A few examples

Registering mixins and variables
```
  // the mixin can have any number of arguments provided when the mixin is referenced
  css.mixin('mixin-name', function(arg1, arg2, ...) {
    return {
      // any attributes will be included with the styleset results
    };
  });

  // add variables that can be referenced in stylesets using this.get("varName");
  css.vars({
    foo: 'bar'
  });
```

Creating a stylesheet
```
module.exports = require('react-css-builder').register('my-namespace', {
  // use javascript-style humpback CSS here
  myCssClass: {
    color: 'white'
  },

  fancierCssClass: function(css) {
    return css
      // include the attributes from the "myCssClass" (in this namespace / css file)
      .include('myCssClass')

      // include the attributes from a class in another namespace (1st param to register method)
      .include('another-namespace.anotherCssClass')

      // include attributes from a mixin (vendor-prefix example can be seen later)
      .mixin('vendor-prefix', 'border-radius', 3)

      // add attitional styles
      .val({
        // you can reference global or class reference variables
        background-color: this.get('backgroundColor'),
        // or just use simple attributes
        backgroundImage: ...
      })
  },

  simpleReferenceTimeExecutionClass: function() {
    // if don't need any registered variables or mixin use but just want to evaluate
    // something when the styleset is referenced
    return {
      height: window.innerHeight + 'px'
    };
  }
})
```

To use the class references
```
  // eager fetch the styleset if possible
  var css = require('path/to/my/css/file');

  // simple styleset reference with no variables or additional attributes
  var simpleStyleset = css.css('myCssClass');

  // to provide variables and/or additional attributes (notice the method is "get" instead of "css")
  var advancedStyleset = css.get('fancierCssClass')

    // add variables that can be referenced using this.get("varName")
    .vars({
      border: 1
    })

    // add additional attributes defined here
    .attr({
      fontFamily: 'arial'
    })

    // get the styleset (now we use the "css" function)
    .css();

  ...
    render: function() {
      return <div style={advancedStyleset}>Hello</div>
    }
  }
```

more documentation to come