import { ColHeightMap, debounce, DEFAULT_COLS, DEFAULT_DEBOUNCE_MS, DEFAULT_GAP_PX, DEFAULT_MAX_COL_WIDTH, ELEMENT_NODE_TYPE, findSmallestColIndex, getColCount, getNumberAttribute, MasonryItemCachedRead } from "./masonry-helpers";

/**
 * Typings required for the resize observer.
 */
declare interface ResizeObserver {
	observe (target: Element): void;
	unobserve (target: Element): void;
	disconnect (): void;
}

declare type ResizeObserverEntries = {contentRect: {width: number, height: number}}[];
declare type ResizeObserverConstructor = new (callback: ((entries: ResizeObserverEntries) => void)) => ResizeObserver;
declare const ResizeObserver: ResizeObserverConstructor;

/**
 * Typings required for ShadyCSS.
 */
declare global {
	interface Window {ShadyCSS?: any;}
}

/**
 * Template for the masonry layout.
 */

const $template = document.createElement("template");
$template.innerHTML = `
  <style>
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: stretch;
    }

    .column {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .column:not(:last-child) {
      margin-right: var(--_masonry-layout-gap, ${DEFAULT_GAP_PX}px);
    }

    .column ::slotted(*) {
      margin-bottom: var(--_masonry-layout-gap, ${DEFAULT_GAP_PX}px);
      box-sizing: border-box;
    }

    /* Hide the items that has not yet found the correct slot */
    #unset-items {
      opacity: 0;
      position: absolute;
      pointer-events: none;
    }
  </style>
  <div id="unset-items">
    <slot></slot>
  </div>
`;

// Use polyfill only in browsers that lack native Shadow DOM.
window.ShadyCSS && window.ShadyCSS.prepareTemplateStyles($template, "masonry-layout");

/**
 * Masonry layout web component. It places the slotted elements in the optimal position based
 * on the available vertical space, just like mason fitting stones in a wall.
 * @example <masonry-layout><div class="item"></div><div class="item"></div></masonry-layout>
 * @csspart column - Each column of the masonry layout.
 * @csspart column-index - The specific column at the given index (eg. column-0 would target the first column and so on))
 * @slot - Items that should be distributed in the layout.
 */
export class MasonryLayout extends HTMLElement {

	// The observed attributes.
	// Whenever one of these changes we need to update the layout.
	static get observedAttributes () {
		return ["maxcolwidth", "gap", "cols"];
	}

	/**
	 * The maximum width of each column if cols are set to auto.
	 * @attr maxcolwidth
	 * @param v
	 */
	set maxColWidth (v) {
		this.setAttribute("maxcolwidth", v.toString());
	}

	get maxColWidth () {
		return getNumberAttribute(this, "maxcolwidth", DEFAULT_MAX_COL_WIDTH);
	}

	/**
	 * The amount of columns.
	 * @attr cols
	 * @param v
	 */
	set cols (v) {
		this.setAttribute("cols", v.toString());
	}

	get cols () {
		return getNumberAttribute(this, "cols", DEFAULT_COLS);
	}

	/**
	 * The gap in pixels between the columns.
	 * @attr gap
	 * @param v
	 */
	set gap (v) {
		this.setAttribute("gap", v.toString());
	}

	get gap () {
		return getNumberAttribute(this, "gap", DEFAULT_GAP_PX);
	}

	/**
	 * The ms of debounce when the element resizes.
	 * @attr debounce
	 * @param v
	 */
	set debounce (v) {
		this.setAttribute("debounce", v.toString());
	}

	get debounce () {
		return getNumberAttribute(this, "debounce", DEFAULT_DEBOUNCE_MS);
	}

	/**
	 * The column elements.
	 */
	private get $columns (): HTMLElement[] {
		return Array.from(this.shadowRoot!.querySelectorAll( `.column`)) as HTMLElement[];
	}

	// Unique debounce ID so different masonry layouts on one page won't affect eachother
	private debounceId: string = `layout_${Math.random()}`;

	// Prepare a weakmap for the cache
	private cachedReads = new WeakMap<HTMLElement, MasonryItemCachedRead>();

	// Reference to the default slot element
	private $unsetElementsSlot!: HTMLSlotElement;

	// Resize observer that layouts when necessary
	private ro: ResizeObserver | undefined = undefined;

	/**
	 * Attach the shadow DOM.
	 */
	constructor () {
		super();
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild($template.content.cloneNode(true));

		this.onSlotChange = this.onSlotChange.bind(this);
		this.onResize = this.onResize.bind(this);
		this.layout = this.layout.bind(this);

		this.$unsetElementsSlot = this.shadowRoot!.querySelector<HTMLSlotElement>("#unset-items > slot")!;
	}

	/**
	 * Hook up event listeners when added to the DOM.
	 */
	connectedCallback () {
		this.$unsetElementsSlot.addEventListener("slotchange", this.onSlotChange);

		// Attach resize observer so we can relayout eachtime the size changes
		if ("ResizeObserver" in window) {
			this.ro = new ResizeObserver(this.onResize);
			this.ro.observe(this);

		} else {
			window.addEventListener("resize", this.onResize as any);
		}
	}

	/**
	 * Remove event listeners when removed from the DOM.
	 */
	disconnectedCallback () {
		this.$unsetElementsSlot.removeEventListener("slotchange", this.onSlotChange);
		window.removeEventListener("resize", this.onResize as any);
		if (this.ro != null) {
			this.ro.unobserve(this);
		}
	}

	/**
	 * Updates the layout when one of the observed attributes changes.
	 */
	attributeChangedCallback (name: string) {
		switch (name) {
			case "gap":
				this.style.setProperty(`--_masonry-layout-gap`, `${this.gap}px`);
				break;
		}

		// Recalculate the layout
		this.scheduleLayout();
	}

	/**
	 *
	 */
	onSlotChange () {

		// Grab unset elements
		const $unsetElements = this.$unsetElementsSlot.assignedNodes().filter(node => node.nodeType === ELEMENT_NODE_TYPE);

		// If there are more items not yet set layout straight awy to avoid the item being delayed in its render.
		if ($unsetElements.length > 0) {
			this.layout();
		}
	}

	/**
	 * Each time the element resizes we need to schedule a layout
	 * if the amount available columns has has changed.
	 * @param entries
	 */
	onResize (entries?: ResizeObserverEntries) {

		// Grab the width of the element. If it isn't provided by the resize observer entry
		// we compute it ourselves by looking at the offset width of the element.
		const {width} = entries != null && entries.length > 0
			? entries[0].contentRect : {width: this.offsetWidth};

		// Get the amount of columns we should have
		const colCount = getColCount(
			width,
			this.cols,
			this.maxColWidth
		);

		// Compare the amount of columns we should have to the current amount of columns.
		// Schedule a layout that invalidates the cache if they are no longer the same.
		if (colCount !== this.$columns.length) {
			this.scheduleLayout(this.debounce, true);
		}
	}

	/**
	 * Render X amount of columns.
	 * @param colCount
	 */
	renderCols (colCount: number) {

		// Get the current columns
		const $columns = this.$columns;

		// If the amount of columns is correct we don't have to add new columns.
		if ($columns.length === colCount) {
			return;
		}

		// Remove all of the current columns
		for (const $column of $columns) {
			$column.remove();
		}

		// Add some new columns
		for (let i = 0; i < colCount; i++) {

			// Create a column element
			const $column = document.createElement(`div`);
			$column.classList.add(`column`);
			$column.setAttribute(`part`, `column column-${i}`);

			// Add a slot with the name set to the index of the column
			const $slot = document.createElement(`slot`);
			$slot.setAttribute(`name`, i.toString());

			// Append the slot to the column an the column to the shadow root.
			$column.appendChild($slot);
			this.shadowRoot!.appendChild($column);
		}
	}

	/**
	 * Caches a read for an element.
	 * @param $elem
	 */
	cacheRead ($elem: HTMLElement): MasonryItemCachedRead {

		// Read properties of the element
		const value: MasonryItemCachedRead = {
			height: $elem.getBoundingClientRect().height
		};

		// Cache the read of the element
		this.cachedReads.set($elem, value);
		return value;
	}

	/**
	 * Schedules a layout.
	 * @param ms
	 * @param invalidateCache
	 */
	scheduleLayout (ms: number = this.debounce, invalidateCache: boolean = false) {
		debounce(() => this.layout(invalidateCache), ms, this.debounceId);
	}

	/**
	 * Layouts the elements.
	 * @param invalidateCache
	 */
	layout (invalidateCache: boolean = false) {
		requestAnimationFrame(() => {
			// console.time("layout");

			// Compute relevant values we are going to use for layouting the elements.
			const gap = this.gap;
			const $elements = Array.from(this.children).filter(node => node.nodeType === ELEMENT_NODE_TYPE) as HTMLElement[];
			const colCount = getColCount(
				this.offsetWidth,
				this.cols,
				this.maxColWidth
			);

			// Have an array that keeps track of the highest col height.
			const colHeights: ColHeightMap = Array(colCount).fill(0) as ColHeightMap;

			// Instead of interleaving reads and writes we create an array for all writes so we can batch them at once.
			const writes: (() => void)[] = [];

			// Go through all elements and figure out what column (aka slot) they should be put in.
			for (const $elem of $elements) {

				// Get the read data of the item (either, pick the cached value or cache it while reading it).
				let {height} =
					invalidateCache || !this.cachedReads.has($elem)
						? this.cacheRead($elem)
						: this.cachedReads.get($elem)!;

				// Find the currently smallest column
				let smallestColIndex = findSmallestColIndex(colHeights);

				// Add the height of the item and the gap to the column heights.
				// It is very important we add the gap since the more elements we have,
				// the bigger the role the margins play when computing the actual height of the columns.
				colHeights[smallestColIndex] += height + gap;

				// Set the slot on the element to get the element to the correct column.
				// Only do it if the slot has actually changed.
				const newSlot = smallestColIndex.toString();
				if ($elem.slot !== newSlot) {
					writes.push(() => ($elem.slot = newSlot));
				}
			}

			// Batch all the writes at once
			for (const write of writes) {
				write();
			}

			// Render the columns
			this.renderCols(colCount);

			// Commit the changes for ShadyCSS
			window.ShadyCSS && window.ShadyCSS.styleElement(this);

			// console.timeEnd("layout");
		});
	}
}

customElements.define("masonry-layout", MasonryLayout);

declare global {
	interface HTMLElementTagNameMap {
		"masonry-layout": MasonryLayout;
	}
}