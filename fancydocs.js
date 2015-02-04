registerProject({"title":"react-css-builder","summary":"CSS builder for creating inline react component style objects\n\nIf you want React to do native well, you need to use inline styles.  But, you can still get the DRY and maintainability benefits of an external stylesheet with react-css-builder.\n\nYou can create a javascript stylesheet similar to what you would see with a CSS precompiler but you can actually use variables calculated at runtime!","installation":"This is a CommonJS component only, you simply need to require ```react-css-builder``` and adding the component to ```package.json```\n```\nnpm install --save react-css-builder\n```\n","api":{"API":{"methods":{},"packages":{"react-css-builder":{"overview":"This is the object returned when calling ```require('react-css-builder')```","methods":{"register":{"profiles":["[namespace,] styleSet"],"params":{"namespace":"(string) optional namespace used if any references will be made to another styleset from the styleset being registered","styleSet":"the object representing the set of styles (kind of like a stylesheet)"},"summary":"Register a set of styles which are associated with an alias which can be referenced like a css class.","dependsOn":[],"overview":"Return the [CSSBuilder](#FIXME) object\n\n```\nmodule.exports = require('react-css-builder').register('some-namespace', {\n  // the stylesets can be much more advanced, this is an example most similar to CSS\n  myClass: {\n    color: 'white'\n  },\n  anotherClass: {\n    color: 'black'\n  }\n});\n```\nsee [Advanced Stylesets](#FIXME) to see all available options including, importing external stylesets, using mixins, variable references and nested styles."},"vars":{"profiles":["varsObject"],"params":{"varsObject":"a hash of variables to register which will be available to styleset rules (using this.get(\"varName\"))."},"summary":"```\nvar css = require('react-css-builder');\ncss.vars({\n  primaryColor: 'white'\n});","dependsOn":[],"overview":"// variables available using this.get within a stylesheet rule function\ncss.register('my-styleset-namespace', {\n  myClass: function() {\n    return color: this.get('primaryColor')\n  }\n});\n```"},"mixin":{"profiles":["mixinName, mixinFunction"],"params":{"mixinName":"the name of the mixin","mixinFunction":"the mixin function which can take any number of arguments"},"summary":"The mixin can be included in a styleset function.  It should return an object represent all style attributes which should be included.","dependsOn":[],"overview":"```\nvar css = require('react-css-builder');\ncss.mixin('background-image', function(imagePath) {\n  // silly little example\n  return {\n    backgroundImage: 'url(\\\"' + imagePath + '\\\")'\n  };\n});\n\n// mixins can be referenced using ```css.mixin``` within a stylesheet rule function (```css``` is the styleset rule function argument)\ncss.register('my-styleset', {\n  myClass: function(css) {\n    return css\n      .mixin('background-image', 'foo.gif')\n      .val();\n  }\n});\n```"}}},"StylesetBuilder":{"overview":"This is the object returned when calling ```get``` from a [StylesetBuilder](#link/%23FIXME).  It is used to apply variables and attributes to a styleset request.","methods":{"attr":{"profiles":["styleAttributes"],"params":{"styleAttributes":"Additional attributes that should be included with the attributes defined with the styleset defined by the class name."},"summary":"```\nvar stylesheet = require('...').register({\n  myStyleClass: {\n    backgroundColor: 'black'\n  }\n});\nvar myStyle = stylesheet.get('myStyleClass').attr({color: 'white'}).css();\n// will be {color: 'white', backgroundColor: 'black'}\n```","dependsOn":[],"overview":""},"vars":{"profiles":["variables"],"params":{"variables":"Object specifying additional variables to be made accessable to the styleset function or referenced mixin functions as ```this.get(\"varName\")```"},"summary":"```\nvar stylesheet = require('...').register({\n  myStyleClass: function() {\n    var radius = this.get('radius');\n    return {\n      borderRadius: radius,\n      WebkitBorderRadius: radius\n    }\n  }\n});\nvar myStyle = stylesheet.get('myStyleClass').var({radius: 3}).css();\n// will be {borderRadius: 3, WebkitBorderRadius: 3}\n```","dependsOn":[],"overview":""}}},"StyleContext":{"overview":"This is the object provided as the single argument a styleset if the styleset value is a function rather than a simple object specifying the style attributes.","methods":{"include":{"profiles":["stylesetName"],"params":{"stylesetName":"the name of a styleset in the current stylesheet or, if prefixed with the namespace separated by a ```.```, the name of a styleset in another stylesheet."},"summary":"Include all of the attributes defined by another styleset.","dependsOn":[],"overview":"```\nvar stylesheet = require('...').register({\n  anotherStyleClass: {\n    color: 'white'\n  },\n  myStyleClass: function(css) {\n    return css\n      .include('anotherStyleClass')\n      .val();\n  }\n});\nvar myStyle = stylesheet.css('myStyleClass');\n// will be {color: 'white'}\n```"},"mixin":{"profiles":["mixinName[, mixinParameters]"],"params":{"mixinName":"the name of a registered mixin to include","mixinParameters":"any number of parameters that the mixin is expecting"},"summary":"Include all of the attributes returned by a registered by a mixin","dependsOn":[],"overview":"```\n// very silly example just to demonstrate a mixin\nvar stylesheet = require('...').register({\n  myStyleClass: function(css) {\n    return css\n      .mixin('color', 'white')\n      .val();\n  }\n});\nstylesheet.register('myMixin', function(name, value) {\n  var rtn = {};\n  rtn[name] = value;\n  return rtn;\n});\n\nvar myStyle = stylesheet.css('myStyleClass');\n// will be {color: 'white'}\n```"},"val":{"profiles":[""],"params":{},"summary":"Called when all attribute inclusions are complete to return the styleset attributes.\n```\nvar stylesheet = require('...').register({\n  myStyleClass: function(css) {\n    return css\n      // add any attributes or mixins\n      .val();\n  }\n});\n```","dependsOn":[],"overview":""}}}}}},"sections":[{"body":"","title":"Examples","sections":[{"body":"```\n  var css = require('react-css-builder');\n\n  // the mixin can have any number of arguments provided when the mixin is referenced\n  css.mixin('vendor-prefix', function(name, value) {\n\n    // for example only, a smarter impl would eval the user agent to include the appropriate prefix\n    var rtn = {};\n    // if you have underscore\n    _.each(['O', 'Webkit', 'ms', 'Moz'], function(prefix) {\n      rtn[prefix + name] = value;\n    });\n    rtn[name] = value;\n    return rtn;\n  });\n\n  // add variables that can be referenced in stylesets using this.get(\"varName\");\n  css.vars({\n    foo: 'bar'\n  });\n```","title":"Registering mixins and variables","sections":[]},{"body":"```\nmodule.exports = require('react-css-builder').register('my-namespace', {\n  // use javascript-style humpback CSS here\n  myCssClass: {\n    color: 'white'\n  },\n\n  fancierCssClass: function(css) {\n    return css\n      // include the attributes from the \"myCssClass\" (in this namespace / css file)\n      .include('myCssClass')\n\n      // include the attributes from a class in another namespace (1st param to register method)\n      .include('another-namespace.anotherCssClass')\n\n      // include attributes from a mixin (vendor-prefix example can be seen later)\n      .mixin('vendor-prefix', 'border-radius', 3)\n\n      // add attitional styles\n      .val({\n        // you can reference global or class reference variables\n        background-color: this.get('backgroundColor'),\n        // or just use simple attributes\n        backgroundImage: ...\n      })\n  },\n\n  simpleReferenceTimeExecutionClass: function() {\n    // if don't need any registered variables or mixin use but just want to evaluate\n    // something when the styleset is referenced\n    return {\n      height: window.innerHeight + 'px'\n    };\n  }\n})\n```","title":"Creating a stylesheet","sections":[]},{"body":"```\n  // eager fetch the styleset if possible\n  var stylesheet = require('path/to/my/css/file');\n\n  // simple styleset reference with no variables or additional attributes\n  var simpleStyleset = css.css('myCssClass');\n\n  // to provide variables and/or additional attributes (notice the method is \"get\" instead of \"css\")\n  var advancedStyleset = stylesheet.get('fancierCssClass')\n\n    // add variables that can be referenced using this.get(\"varName\")\n    .vars({\n      border: 1\n    })\n\n    // add additional attributes defined here\n    .attr({\n      fontFamily: 'arial'\n    })\n\n    // get the styleset (now we use the \"css\" function)\n    .css();\n\n  ...\n    render: function() {\n      return <div style={advancedStyleset}>Hello</div>\n    }\n  }\n```","title":"Using Class References","sections":[]}]}]});
