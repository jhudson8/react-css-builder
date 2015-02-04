react-css-builder
==============
CSS builder for creating inline react component style objects

If you want React to do native well, you need to use inline styles.  But, you can still get the DRY and maintainability benefits of an external stylesheet with react-css-builder.

You can create a javascript stylesheet similar to what you would see with a CSS precompiler but you can actually use variables calculated at runtime!

```
// *very* simple example - more advance capabilities are not demonstrated here
var stylesheet = require('react-css-builder').register({
  myClass: {
    color: 'white'
  }
});

var styleAttributes = stylesheet.css('myClass');
...
render: function() {
  return <div style={styleAttributes}/>
}
```

Installation
--------------
This is a CommonJS component only, you simply need to require ```react-css-builder``` and adding the component to ```package.json```
```
npm install --save react-css-builder
```

API
-------------
### react-css-builder
This is the object returned when calling ```require('react-css-builder')```

#### register([namespace,] styleSet)
* ***namespace***: (string) optional namespace used if any references will be made to another styleset from the styleset being registered
* ***styleSet***: the object representing the set of styles (kind of like a stylesheet)

Register a set of styles which are associated with an alias which can be referenced like a css class.

Return the [Stylesheet](#project/jhudson8/react-css-builder/package/Stylesheet) object

```
module.exports = require('react-css-builder').register('some-namespace', {
  // the stylesets can be much more advanced, this is an example most similar to CSS
  myClass: {
    color: 'white'
  },
  anotherClass: {
    color: 'black'
  }
});
```
see [Examples](#project/jhudson8/react-css-builder/section/Examples) to see all available options including, importing external stylesets, using mixins, variable references and nested styles.

#### vars(varsObject)
* ***varsObject***: a hash of variables to register which will be available to styleset rules (using this.get("varName")).

```
var css = require('react-css-builder');
css.vars({
  primaryColor: 'white'
});

// variables available using this.get within a stylesheet rule function
css.register('my-styleset-namespace', {
  myClass: function() {
    return color: this.get('primaryColor')
  }
});
```
#### mixin(mixinName, mixinFunction)
* ***mixinName***: the name of the mixin
* ***mixinFunction***: the mixin function which can take any number of arguments

The mixin can be included in a styleset function.  It should return an object represent all style attributes which should be included.

```
var css = require('react-css-builder');
css.mixin('background-image', function(imagePath) {
  // silly little example
  return {
    backgroundImage: 'url(\"' + imagePath + '\")'
  };
});

// mixins can be referenced using ```css.mixin``` within a stylesheet rule function (```css``` is the styleset rule function argument)
css.register('my-styleset', {
  myClass: function(css) {
    return css
      .mixin('background-image', 'foo.gif')
      .val();
  }
});
```


### Stylesheet
This is the object returned when calling ```require('react-css-builder').register(...)

#### css(className)
* ***className***: return the styleset object matching the className key which can be used for associated with a React component ```style``` property.

If the ```className``` value has ```.``` values in it, styleset rules will be referenced as nested objects.

```
var stylesheet = require('react-css-builder').register({
  panel: {
    // attributes is a special key used when nesting if the current level should have style attributes
    attributes: {
      color: 'white'
    },
    header: {
      color: 'black'
    }
  }
});
stylesheet.css('panel'); // = {color: 'white'}
stylesheet.css('panel.header'); // = {color: 'black'}
```

#### get(className)
* ***className***: return the styleset object matching the className key which can be used for associated with a React component ```style``` property.

Very much like the previously described ```css``` method but allows for additional variables and style attributes to be provided.  The ```css``` method is used to return the style response.

Returns a [StylesetBuilder](#project/jhudson8/react-css-builder/package/StylesetBuilder)

```
var stylesheet = require('...').register(...)
stylesheet.get('myStyle')
  .vars({
    foo: 'this var will be available in the styleset function / mixin function as this.get("foo")'
  })
  .attr({
    content: 'this will be an additional attribute included in the returned styleset'
  })
  // this returns the styleset value
  .css();
```

#### mixin(mixinName, mixinFunction)
* ***mixinName***: the name of the mixin
* ***mixinFunction***: the mixin function which can take any number of arguments

Exactly the same as [react-css-builder mixin](#project/jhudson8/react-css-builder/method/react-css-builder/mixin) except that the mixin registered will *only* be accessable to this particular stylesheet.

#### vars(varsObject)
* ***varsObject***: a hash of variables to register which will be available to styleset rules (using this.get("varName")).

Exactly the same as [react-css-builder vars](l#project/jhudson8/react-css-builder/method/react-css-builder/vars) except that the provided variables will *only* be accessable to this particular stylesheet.


### StylesetBuilder
This is the object returned when calling ```get``` from a [StylesetBuilder](#project/jhudson8/react-css-builder/package/StylesetBuilder).  It is used to apply variables and attributes to a styleset request.

#### attr(styleAttributes)
* ***styleAttributes***: Additional attributes that should be included with the attributes defined with the styleset defined by the class name.

```
var stylesheet = require('...').register({
  myStyleClass: {
    backgroundColor: 'black'
  }
});
var myStyle = stylesheet.get('myStyleClass').attr({color: 'white'}).css();
// will be {color: 'white', backgroundColor: 'black'}
```

#### vars(variables)
* ***variables***: Object specifying additional variables to be made accessable to the styleset function or referenced mixin functions as ```this.get("varName")```

```
var stylesheet = require('...').register({
  myStyleClass: function() {
    var radius = this.get('radius');
    return {
      borderRadius: radius,
      WebkitBorderRadius: radius
    }
  }
});
var myStyle = stylesheet.get('myStyleClass').var({radius: 3}).css();
// will be {borderRadius: 3, WebkitBorderRadius: 3}
```

### StyleContext
This is the object provided as the single argument a styleset if the styleset value is a function rather than a simple object specifying the style attributes.

#### include(stylesetName)
* ***stylesetName***: the name of a styleset in the current stylesheet or, if prefixed with the namespace separated by a ```.```, the name of a styleset in another stylesheet.

Include all of the attributes defined by another styleset.

```
var stylesheet = require('...').register({
  anotherStyleClass: {
    color: 'white'
  },
  myStyleClass: function(css) {
    return css
      .include('anotherStyleClass')
      .val();
  }
});
var myStyle = stylesheet.css('myStyleClass');
// will be {color: 'white'}
```

#### mixin(mixinName[, mixinParameters])
* ***mixinName***: the name of a registered mixin to include
* ***mixinParameters***: any number of parameters that the mixin is expecting

Include all of the attributes returned by a registered by a mixin

```
// very silly example just to demonstrate a mixin
var stylesheet = require('...').register({
  myStyleClass: function(css) {
    return css
      .mixin('color', 'white')
      .val();
  }
});
stylesheet.register('myMixin', function(name, value) {
  var rtn = {};
  rtn[name] = value;
  return rtn;
});

var myStyle = stylesheet.css('myStyleClass');
// will be {color: 'white'}
```

#### val()
Called when all attribute inclusions are complete to return the styleset attributes.
```
var stylesheet = require('...').register({
  myStyleClass: function(css) {
    return css
      // add any attributes or mixins
      .val();
  }
});
```

Sections
----------
### Usage
#### Creating a stylesheet
The [register](#project/jhudson8/react-css-builder/method/react-css-builder/register) method is used to create a new stylesheet that can be used.

```
module.exports = require('react-css-builder').register('optional-namespace', {
  // include any stylesets
  myCssClass: {
    color: 'white'
  }
```

#### Styleset Definitions
We're using "styleset" as the term for attributes given to a specific CSS class.  Stylesets can be implemented in 3 different ways

Standard attributes
```
  myClass: {
    border: 'solid 1px #000'
  }
```

Function returning standard attributes
```
  // we might do this if we want to access variables
  myClass: function() {
    border: this.get('border')
  }
```

Function which returns results from a [StyleContext](#project/jhudson8/react-css-builder/package/StyleContext)
```
  // we might do this if we want to include other stylesets or use mixins
  myClass: function(css) {
    return css
      .mixin(...)
      .include(...)
      .attr(...)
      .val();
  }
```


#### Styleset Path Selectors
Multiple stylesets can be included with a single styleset reference.

* Each styleset reference should be separated with a space or comma.
* Nested stylesets should be sparated with ```.```.
* multiple nested styleset references have a shorthand of parent[child1 {space or comma} child2 ...]

For example
```
foo, a[b c] d[e,f], bar
```
would result in the following stylets
```
['foo', 'a.b', 'a.c', 'd.e', 'd.f', 'bar']
```
Matching a stylesheet like the following
```
{
  foo: { ... },

  a: {
    attributes: { ... }
    b: { ... },
    c: { ... }
  },

  d: {
    attributes: { ... },
    e: { ... },
    f: { ... }
  },

  bar: { ... }
}
```


#### Mixins
See [Mixins API](#project/jhudson8/react-css-builder/method/react-css-builder/mixin) to understand how to register mixins

Mixins can return any number of attributes that should be applied to a styleset.

```
  var stylesheet = require('react-css-builder').register({

    myClassUsingMixins: function(css) {
      return css
        .mixin('the-mixin-name', param1, param2, ...)
        .attr({
          // include any additional attributes
        })
        .val();
    }
  });
```


#### Variables
See [Variables API](#project/jhudson8/react-css-builder/method/react-css-builder/vars) to understand how to register variables

Variables can be referenced in a styleset definition using ```this.get("varName")```
```
  var stylesheet = require('react-css-builder').register({

    myClassUsingMixins: function() {
      return {
        border: this.get('border')
      }
    }
  });

  // variables can be set globally
  require('react-css-builder').vars({ border: 'solid 2px #000'});

  // variables can be set on a specific stylesheet
  stylesheet.vars({ border: 'solid 2px #000'});

  // variables can be set when referencing the styleset directly
  var myStyle = stylesheet.get('myClassUsingMixins').vars({ border: 'solid 2px #000'}).css();
```


#### Includes
It is possible to merge other styleset attributes using ```include```.  Stylesets can be referenced in the current stylesheet or in another stylesheet if the styleset name is prefixed with a ```.```.
```
  var stylesheet = require('react-css-builder').register({

    someOtherClass: {
      width: '100%'
    },

    myClassWithIncludes: function(css) {
      return css
        .include('someOtherClass')
        .attr({
          // include any additional attributes
        })
        .val();
    }
  });
```