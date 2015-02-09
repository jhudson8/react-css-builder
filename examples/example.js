// we're not even getting into some other advanced functionality like namespacing stylesheets and referencing
// stylesheets with different namespaces so check out the docs for other features

var reactCSSBuilder = require('react-css-builder');
var stylesheet = module.exports = reactCSSBuilder.create({

  myClass: {
    border: 'solid 1px #000'
  },

  myClassGroup: {
    // any class group must have an "attributes" property
    // it's what is returned with // retrieved using stylesheet.css('myClassGroup')
    attributes: {},

    // retrieved using stylesheet.css('myClassGroup.groupChild1')
    groupChild1: {
      padding: "2px"
    },

    // retrieved using stylesheet.css('myClassGroup.groupChild2')
    groupChild2: {
      margin: "2px"
    },
  },

  // include the styles from "myClassGroup" and "myClassGroup.groupChild1"
  myClassWithIncludes: function(css) {
    return css
      .include('myClass')
      .include('myClassGroup.groupChild1')
      .css();
  },

  // use a mixin to provide additional style attributes based on the function arguments
  myClassWithMixin: function(css) {
    return css
      .mixin('myMixin', 'param1', 'as many params as I want')
      .css();
  },

  // reference variables (global, stylesheet specific, or specific to an individual style class reference)
  myClassUsingVariables: function() {
    return {
      border: this.get('primaryBorder')
    };
  },

  // the kitchen sink
  myClassWithEverything: function(css) {
    return css
      .include('myClass')
      .mixin('myMixin', 'param1', 'as many params as I want')
      .attr({
        // include additional attributes to be returned
        border: this.get('primaryBorder')
      });
  }
});

// add a mixin
reactCSSBuilder.mixin('myMixin', function(param1, param2) {
  return {
    // We're not even using the parameters here but we could...
    width: '100%'
  };
});

// add a global variable
reactCSSBuilder.vars({
  primaryBorder: 'solid 5px #000'
});

// this is how we retreive style values
var styleAttributes = stylesheet.css('myClassWithEverything');

// now override the border variable (used by the myClassWithEverything) styleset definition
var styleAttributes = stylesheet.get('myClassWithEverything').vars({ primaryBorder: 'solid 1px #000' }).css();
