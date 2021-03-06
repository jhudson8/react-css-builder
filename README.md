react-css-builder
==============
CSS builder for creating inline react component style objects

If you want React to [do native well](https://www.youtube.com/watch?v=7rDsRXj9-cU), you need to use inline styles.  But, you can still get the DRY and maintainability benefits of an external stylesheet with react-css-builder.

The advantages of creating the CSS attributes using javascript are

* You can use runtime variables
* You can use scoped (global, stylesheet specific and style reference specific)
* There is a large byte savings if you use a lot of mixins and class inheritance as compared to css preprocessor output
* You bypass some browser CSS issues because the style attributes end up as an inline style attribute

[View the installation and API docs](http://jhudson8.github.io/fancydocs/index.html#project/jhudson8/react-css-builder)


## Examples
take a look at some [examples](https://github.com/jhudson8/react-css-builder/blob/master/examples/example.js)


### Other React projects that may interest you

* [jhudson8/react-mixin-manager](https://github.com/jhudson8/react-mixin-manager)
* [jhudson8/react-backbone](https://github.com/jhudson8/react-backbone)
* [jhudson8/react-events](https://github.com/jhudson8/react-events)
* [jhudson8/react-chartjs](https://github.com/jhudson8/react-chartjs)

