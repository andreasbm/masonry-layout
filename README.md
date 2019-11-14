<h1 align="center">@appnest/masonry-layout</h1>

<p align="center">
		<a href="https://npmcharts.com/compare/@appnest/masonry-layout?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@appnest/masonry-layout.svg" height="20"/></a>
<a href="https://www.npmjs.com/package/@appnest/masonry-layout"><img alt="NPM Version" src="https://img.shields.io/npm/v/@appnest/masonry-layout.svg" height="20"/></a>
<a href="https://david-dm.org/andreasbm/masonry-layout"><img alt="Dependencies" src="https://img.shields.io/david/andreasbm/masonry-layout.svg" height="20"/></a>
<a href="https://github.com/andreasbm/masonry-layout/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/andreasbm/masonry-layout.svg" height="20"/></a>
<a href="https://www.webcomponents.org/element/@appnest/masonry-layout"><img alt="Published on webcomponents.org" src="https://img.shields.io/badge/webcomponents.org-published-blue.svg" height="20"/></a>
	</p>


<p align="center">
  <b>An efficient and fast web component that gives you a beautiful masonry layout</b></br>
  <sub> Go here to see a demo <a href="https://appnest-demo.firebaseapp.com/masonry-layout">https://appnest-demo.firebaseapp.com/masonry-layout</a>.<sub>
</p>

<br />


<p align="center">
	<img src="https://raw.githubusercontent.com/andreasbm/masonry-layout/master/example.gif" width="600">
</p>

* **Simple:** Works right out of the box (just add it to your markup)
* **Lightweight:** Super small (1kb minified & gzipped)
* **Zero dependencies:** Created using only vanilla js - no dependencies and framework agnostic!
* **Customizable:** Can customize almost everything (eg. columns, transitions, gap).
* **User friendly:** Automatically re-distribute items when the size of the grid changes or new elements are added
* **Performant:** Efficient & fast - Build with performance in mind


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)](#installation)

## ➤ Installation

```javascript
npm i @appnest/masonry-layout
```

If you prefer to use `umd` bundle you can load `https://unpkg.com/@appnest/masonry-layout/umd/masonry-layout.min.js` instead.


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)](#example)

## ➤ Example

Import `@appnest/masonry-layout` somewhere in your code and you're ready to go! Simply add the `masonry-layout` element to your `html` and then add your elements in between the start and closing tags.

```html
<masonry-layout>
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
</masonry-layout>
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)](#customize)

## ➤ Customize

Customize the functionality by applying the attributes.

### Amount of columns

The `cols` attribute specifies the amount of columns. The default value is `auto` which ensures to distribute the elements based on the available width.

```html
<masonry-layout cols="5">
  ...
</masonry-layout>
```

### Gap between columns and rows

The `gap` attribute specifies how many pixels the gap between the elements should be. The default value is `24px`.

```html
<masonry-layout gap="50">
  ...
</masonry-layout>
```

### Max column width

The `maxcolwidth` specifies how many pixels a column can maximum have when the `cols` attribute is set to `auto`. The default value is `400px`.

```html
<masonry-layout maxcolwidth="200">
  ...
</masonry-layout>
```

### Change debounce time

The `debounce` attribute specifies the amount of time in ms the layout reflow debounces each time the size of the masonry layout changes. This reflow is debounced to avoid the layout algorithm being invoked too many times in a row. The default value is `300ms`.

```html
<masonry-layout debounce="500">
  ...
</masonry-layout>
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)](#trigger-layout)

## ➤ Trigger layout

If you want to force layout to can call the `layout()` function on the masonry layout.

```js
document.querySelector("masonry-layout").layout();
```

If you wish to debounce the layout you can call the `scheduleLayout()` function instead.

```js
document.querySelector("masonry-layout").scheduleLayout();
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)](#overview)

## ➤ Overview

Here's a complete overview of the element.

### masonry-layout

Masonry layout web component. It places the slotted elements in the optimal position based
on the available vertical space, just like mason fitting stones in a wall.

#### Properties

| Property      | Attribute     | Type               | Description                                      |
|---------------|---------------|--------------------|--------------------------------------------------|
| `cols`        | `cols`        | `number \| "auto"` | The amount of columns.                           |
| `debounce`    | `debounce`    | `number`           | The ms of debounce when the element resizes.     |
| `gap`         | `gap`         | `number`           | The gap in pixels between the columns.           |
| `maxColWidth` | `maxcolwidth` | `number`           | The maximum width of each column if cols are set to auto. |

#### Slots

| Name | Description                                     |
|------|-------------------------------------------------|
|      | Items that should be distributed in the layout. |

#### CSS Shadow Parts

| Part           | Description                                      |
|----------------|--------------------------------------------------|
| `column`       | Each column of the masonry layout.               |
| `column-index` | The specific column at the given index (eg. column-0 would target the first column and so on) |



[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)](#support-for-old-browsers)

## ➤ Support for old browsers

If you are going to support older browsers that doesn't support [Custom Elements](https://caniuse.com/#search=Custom%20Elements), [Shadow Dom](https://caniuse.com/#search=shadow%20root) or [ResizeObservers](https://caniuse.com/#search=resize%20observer) you should polyfill the features. You can do this very easily by using [the brilliant polfiller service](https://github.com/wessberg/polyfiller). This can be done in one line of code by adding the following to your `index.html` before you import the `masonry-layout`.

```html
<script crossorigin src="https://polyfill.app/api/polyfill?features=es,template,shadow-dom,custom-elements,resizeobserver"></script>
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)](#license)

## ➤ License
	
Licensed under [MIT](https://opensource.org/licenses/MIT).