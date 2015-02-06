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

API: Objects
-------------
### react-css-builder
This is the object returned when calling ```require('react-css-builder')```

#### register([namespace,] styleSet)
* ***namespace***: (string) optional namespace used if any references will be made to another styleset from the styleset being registered
* ***styleSet***: the object representing the set of styles (kind of like a stylesheet)

Register a set of styles which are associated with an alias which can be referenced like a css class.

Return the [Stylesheet](#project/jhudson8/react-css-builder/package/Stylesheet) object

See [Creating a stylesheet](#project/jhudson8/react-css-builder/section/Usage/Creating%20a%20stylesheet) for more details.


#### vars(varsObject)
* ***varsObject***: a hash of variables to register which will be available to styleset rules (using this.get("varName")).

See [variables usage](#project/jhudson8/react-css-builder/section/Usage/Variables) for more details.


#### mixin(mixinName, mixinFunction)
* ***mixinName***: the name of the mixin
* ***mixinFunction***: the mixin function which can take any number of arguments

The mixin can be included in a styleset function.  It should return an object represent all style attributes which should be included.

See [mixin usage](#project/jhudson8/react-css-builder/section/Usage/Mixins) for details.


### Stylesheet
This is the object returned when calling ```require('react-css-builder').register(...)```


#### css(className)
* ***className***: return the styleset object matching the className key which can be used for associated with a React component ```style``` property.

If the ```className``` value has ```.``` values in it, styleset rules will be referenced as nested objects.

See [Creating a stylesheet](#project/jhudson8/react-css-builder/section/Usage/Creating%20a%20stylesheet) for more details


#### get(className)
* ***className***: return the styleset object matching the className key which can be used for associated with a React component ```style``` property.

Very much like the previously described ```css``` method but allows for additional variables and style attributes to be provided.  The ```css``` method is used to return the style response.

Returns a [StylesetBuilder](#project/jhudson8/react-css-builder/package/StylesetBuilder)

See [styleset definitions](#project/jhudson8/react-css-builder/section/Usage/Styleset%20Definitions) for more details.


#### mixin(mixinName, mixinFunction)
* ***mixinName***: the name of the mixin
* ***mixinFunction***: the mixin function which can take any number of arguments

Exactly the same as [react-css-builder mixin](#project/jhudson8/react-css-builder/method/react-css-builder/mixin) except that the mixin registered will *only* be accessable to this particular stylesheet.

See [mixin usage](#project/jhudson8/react-css-builder/section/Usage/Mixins) for details.


#### vars(varsObject)
* ***varsObject***: a hash of variables to register which will be available to styleset rules (using this.get("varName")).

Exactly the same as [react-css-builder vars](l#project/jhudson8/react-css-builder/method/react-css-builder/vars) except that the provided variables will *only* be accessable to this particular stylesheet.

See [variables usage](#project/jhudson8/react-css-builder/section/Usage/Variables) for more details.


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

See [variables usage](#project/jhudson8/react-css-builder/section/Usage/Variables) for more details.


#### css()
Return the style attributes object created using the StylesetBuilder.

See [variables usage](#project/jhudson8/react-css-builder/section/Usage/Variables) or [mixins usage](#project/jhudson8/react-css-builder/section/Usage/Mixins) for more details.



### StyleContext
This is the object provided as the single styleset if the styleset value is a function rather than a simple object specifying the style attributes.

See [styleset definitions](#project/jhudson8/react-css-builder/section/Usage/Styleset%20Definitions) for more details.


#### include(stylesetName)
* ***stylesetName***: the name of a styleset in the current stylesheet or, if prefixed with the namespace separated by a ```.```, the name of a styleset in another stylesheet.

Include all of the attributes defined by another styleset.

See [include usage](#project/jhudson8/react-css-builder/section/Usage/Includes) for more details.


#### mixin(mixinName[, mixinParameters])
* ***mixinName***: the name of a registered mixin to include
* ***mixinParameters***: any number of parameters that the mixin is expecting

Include all of the attributes returned by a registered by a mixin

See [mixin usage](#project/jhudson8/react-css-builder/section/Usage/Mixins) for details.


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

Mixins can be registered [globally](#project/jhudson8/react-css-builder/method/react-css-builder/mixin) or scoped to a [single stylesheet](#project/jhudson8/react-css-builder/method/Stylesheet/mixin?focus=outline)
```
  // the mixin can have any number of arguments provided when the mixin is referenced

  css.mixin('vendor-prefix', function(name, value) {

    // for example only, a smarter impl would eval the user agent to include the appropriate prefix
    var rtn = {};
    // if you have underscore
    _.each(['O', 'Webkit', 'ms', 'Moz'], function(prefix) {
      rtn[prefix + name] = value;
    });
    rtn[name] = value;
    return rtn;
  });
```

```
  var stylesheet = require('react-css-builder').register({

    myClassUsingMixins: function(css) {
      return css
        .mixin('vendor-prefix', 'borderRadius', '3px')
        .val();
    }
  });
```


#### Variables
See [Variables API](#project/jhudson8/react-css-builder/method/react-css-builder/vars) to understand how to register variables

Variables can be set [globally](#project/jhudson8/react-css-builder/method/react-css-builder/vars) or scoped to a [single stylesheet](#project/jhudson8/react-css-builder/method/Stylesheet/vars) or set when [getting individual styles attributes](#project/jhudson8/react-css-builder/method/StylesetBuilder/vars?focus=outline).

```
  // variables can be set globally
  require('react-css-builder').vars({ myGlobalVar: 'foo'});

  // variables can be set on a specific stylesheet
  stylesheet.vars({ myStylesheetVar: 'bar'});

  // variables can be set when referencing the styleset directly
  var myStyle = stylesheet.get('myClassUsingMixins').vars({ verySpecificVar: 'baz'}).css();
```

Variables can be referenced in a styleset definition using ```this.get("varName")```
```
  var stylesheet = require('react-css-builder').register({

    myClassUsingMixins: function() {
      return {
        border: this.get('border')
      }
    }
  });
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
