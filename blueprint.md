{{ template:title }}

{{ template:badges }}

{{ template:description }}

<p align="center">
	<img src="https://raw.githubusercontent.com/andreasbm/masonry-layout/master/example.gif" width="600">
</p>

{{ bullets }}

## Installation

```javascript
npm i @appnest/masonry-layout
```

If you prefer to use `umd` bundle you can load `https://unpkg.com/@appnest/masonry-layout/umd/masonry-layout.min.js` instead.

## Example

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

## Customize

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

The `maxcolwidth` specifies how many pixels a column can maximum have when the `cols` are set to `auto`. The default value is `400px`.

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

## Trigger layout

If you want to force layout to can simply call the `layout()` function on the masonry layout.

```js
document.querySelector("masonry-layout").layout();
```

If you wish to debounce the layout you can call the `scheduleLayout()` function instead.

```js
document.querySelector("masonry-layout").scheduleLayout();
```

## Overview

Here's a complete overview of the element.

{{ doc:src/lib/masonry-layout.ts }}

## ResizeObserver

You might want to polyfill the `ResizeObserver`. The observer in the element makes sure to distribute the items whenever the size of the grid changes. If this is not polyfilled you will have to call the `layout()` function yourself when the height of the grid changes. If no `ResizeObserver` can be found on the `window` object it will instead re-distribute items when the size of the window changes.

{{ template:license }}

