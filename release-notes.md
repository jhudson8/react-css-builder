# Release Notes

## Development

[Commits](https://github.com/jhudson8/react-css-builder/compare/v0.2.0...master)

## v0.2.0 - February 8th, 2015
- API Changes - 932eb52

ReactCSSBuilder.register -> ReactCSSBuilder.create
StyleContext.val -> StyleContext.css

```
    require('react-css-builder').register({
      myClass: function(css) {
        return css.
          // stuff with StyleContext
          .val();
      }
    });
```
should now be
```
    require('react-css-builder').create({
      myClass: function(css) {
        return css.
          // stuff with StyleContext
          .css();
      }
    });
```


[Commits](https://github.com/jhudson8/react-css-builder/compare/v0.1.0...v0.2.0)

## v0.1.0 - February 4th, 2015
- add enhanced styleset selectors - b3c5eb8
You can now use ```a[b c]``` or ```a[b,c]``` to be translated to ```a.b, a.c```

- allow for private namespaces and returned css builders - 4655a81
If a namespace is not provided when registering the stylesheet, the response from that call will be the only way to access the stylesets


[Commits](https://github.com/jhudson8/react-css-builder/compare/1ac3818...v0.1.0)
