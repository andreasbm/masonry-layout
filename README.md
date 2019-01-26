# @appnest/masonry-layout

<a href="https://npmcharts.com/compare/@appnest/masonry-layout?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@appnest/masonry-layout.svg" height="20"></img></a>
<a href="https://david-dm.org/andreasbm/masonry-layout"><img alt="Dependencies" src="https://img.shields.io/david/andreasbm/masonry-layout.svg" height="20"></img></a>
<a href="https://www.npmjs.com/package/@appnest/masonry-layout"><img alt="NPM Version" src="https://img.shields.io/npm/v/@appnest/masonry-layout.svg" height="20"></img></a>
<a href="https://github.com/andreasbm/masonry-layout/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/andreasbm/masonry-layout.svg" height="20"></img></a>
<a href="https://opensource.org/licenses/MIT"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-yellow.svg" height="20"></img></a>

## What is this?

This is an efficient and fast web component that gives you a beautiful masonry layout. Go here to see a demo [https://appnest-demo.firebaseapp.com/masonry-layout](https://appnest-demo.firebaseapp.com/masonry-layout).

**Features**

* Works right out of the box (just add it to your markup)
* Can lock columns if specified
* Automatically re-distribute items when the size of the grid changes or new elements are added
* Can add transitions to elements when they reflow
* Can customize the spacing and the amount of columns
* Efficient, fast and small

<img src="https://raw.githubusercontent.com/andreasbm/masonry-layout/master/example.gif" width="600">

## Example

Import `@appnest/masonry-layout` somewhere in your code and you're ready to go! Simply add the masonry layout to your `html` and you'll be singing and dancing from not having to build the masonry layout yourself.

```html
<masonry-layout>
	<div class="item">1</div>
	<div class="item">2</div>
	<div class="item">3</div>
	<div class="item">4</div>
	<div class="item">5</div>
</masonry-layout>
```

## Customize

Customize the functionality by applying the attributes.

### Amount of columns

The `cols` attribute specifies the amount of columns. The default value is `auto` which ensures to distribute the elements based on the available width.

```html
<masonry-layout cols="5">
	...
</masonry-layout>
```

### Spacing between items

The `spacing` attribute specifies how many pixels the spacing between the elements should be. The default value is `24px`.

```html
<masonry-layout spacing="50">
	...
</masonry-layout>
```

### Max column width

The `maxcolwidth` specifies how many pixels a column can maximum have when the `cols` are set to `auto`. The default value is `400px`.

```html
<masonry-layout maxcolwidth="200">
	...
</masonry-layout>
```

### Lock columns

The `collock` attribute locks the columns. When the columns are locked, the layout will only distribute on the y axis when elements change their sizes. The default value is `false`.

```html
<masonry-layout collock>
	...
</masonry-layout>
```

## Trigger layout

If you want to force layout to can simply call the `layout()` function on the masonry layout.

```js
document.querySelector("#masonry").layout();
```

## Note!

You might want to polyfill the `ResizeObserver`. This observer makes sure to distribute the items whenever the size of the grid changes. If this is not polyfilled you will have to call the `layout()` function yourself when the height of the grid changes. If no `ResizeObserver` can be found on the `window` object it will instead re-distribute items when the size of the window changes.

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).

