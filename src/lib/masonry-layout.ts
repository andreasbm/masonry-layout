import { ColHeightMap, createEmptyColHeightMap, debounce, DEFAULT_COLS, DEFAULT_MAX_COL_WIDTH, DEFAULT_SPACING, DISTRIBUTED_ATTR, getBooleanAttribute, getColCount, getColWidth, getNumberAttribute, getShortestCol, itemPosition, LAYOUT_DEBOUNCE_MS, MasonryCols, MasonryItemLayout, setBooleanAttribute, tallestColHeight } from "./masonry-helpers";

declare interface ResizeObserver {
	observe (target: Element): void;
	unobserve (target: Element): void;
	disconnect (): void;
}

declare type ResizeObserverConstructor = new (callback: (() => void)) => ResizeObserver;

declare const ResizeObserver: ResizeObserverConstructor;

const template = document.createElement("template");
template.innerHTML = `
	<style>
		:host {
			--masonry-layout-item-transition: transform 200ms ease;
			
			display: block;
			position: relative;
			visibility: hidden;
			transform: translate3d(0, 0, 0);
			
		}

		::slotted(*) {
			position: absolute;
		}
		
		/* Show the items after they have been distributed */
		:host([data-masonry-distributed]) {
			visibility: visible;
		}
		
		/* Apply the transition after the items have been distributed */
		:host([data-masonry-distributed][transition]) ::slotted([data-masonry-distributed]) {
			transition: var(--masonry-layout-item-transition);
		}
	</style>
	<slot id="slot"></slot>
`;

export class MasonryLayout extends HTMLElement {

	// The observed attributes.
	// Whenever one of these changes we need to update the layout.
	static get observedAttributes () {
		return [
			"maxcolwidth",
			"collock",
			"spacing",
			"cols"
		];
	}

	// A map containing the height for each col
	private currentColHeightMap: ColHeightMap = [];
	private ro: ResizeObserver | undefined = undefined;
	private cancelNextResizeEvent = false;
	private itemCache: WeakMap<HTMLElement, MasonryItemLayout> = new WeakMap<HTMLElement, MasonryItemLayout>();

	// The maximum width of each column if cols are set to auto.
	set maxColWidth (v: number) {
		this.setAttribute("maxcolwidth", v.toString());
	}

	get maxColWidth (): number {
		return getNumberAttribute(this, "maxcolwidth", DEFAULT_MAX_COL_WIDTH);
	}

	// Whether the items should be locked in their columns after the have been placed.
	set colLock (v: boolean) {
		setBooleanAttribute(this, "collock", v);
	}

	get colLock (): boolean {
		return getBooleanAttribute(this, "collock");
	}

	// The spacing between the columns
	set spacing (v: number) {
		this.setAttribute("spacing", v.toString());
	}

	get spacing (): number {
		return getNumberAttribute(this, "spacing", DEFAULT_SPACING);
	}

	// The amount of columns.
	set cols (v: MasonryCols) {
		this.setAttribute("cols", v.toString());
	}

	get cols (): MasonryCols {
		return getNumberAttribute(this, "cols", DEFAULT_COLS);
	}

	// Whether the items should have a transition.
	set transition (v: boolean) {
		setBooleanAttribute(this, "transition", v);
	}

	get transition (): boolean {
		return getBooleanAttribute(this, "transition");
	}

	/**
	 * The slot element.
	 */
	private get $slot (): HTMLSlotElement {
		return this.shadowRoot!.querySelector("slot")! as HTMLSlotElement;
	}

	/**
	 * All of the elements in the slot that are not text nodes.
	 */
	private get $items (): HTMLElement[] {
		return this.$slot.assignedNodes().filter(node => {
			return node.nodeName !== "#text";
		}) as HTMLElement[];
	}

	constructor () {
		super();

		// Attach the shadow root
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));

		// Bind the relevant functions to the element
		this.scheduleLayout = this.scheduleLayout.bind(this);
		this.layout = this.layout.bind(this);
		this.didResize = this.didResize.bind(this);
	}

	/**
	 * Attaches the listeners when the element is added to the DOM.
	 */
	connectedCallback () {
		this.attachListeners();
	}

	/**
	 * Removes listeners when the element is removed from the DOM.
	 */
	disconnectedCallback () {
		this.detachListeners();
	}

	/**
	 * Updates the layout when the observed attributes changes.
	 */
	attributeChangedCallback () {
		this.scheduleLayout();
	}

	/**
	 * Attaches all listeners to the element.
	 */
	private attachListeners () {
		this.$slot.addEventListener("slotchange", this.layout);

		if ("ResizeObserver" in window) {
			this.ro = new ResizeObserver(this.didResize);
			this.ro.observe(this);

		} else {
			window.addEventListener("resize", this.didResize);
		}

	}

	/**
	 * Detaches all listeners from the element.
	 */
	private detachListeners () {
		this.$slot.removeEventListener("slotchange", this.layout);
		window.removeEventListener("resize", this.didResize);
		if (this.ro != null) this.ro.unobserve(this);
	}

	/**
	 * Called when the element resizes and schedules a layout.
	 */
	private didResize () {
		if (this.cancelNextResizeEvent) {
			this.cancelNextResizeEvent = false;
			return;
		}

		this.scheduleLayout();
	}

	/**
	 * Schedules a layout.
	 * @param ms - The debounce time
	 */
	scheduleLayout (ms: number = LAYOUT_DEBOUNCE_MS) {
		debounce(this.layout, LAYOUT_DEBOUNCE_MS, "layout");
	}

	/**
	 * Re-distributes all of the items.
	 */
	layout () {
		requestAnimationFrame(() => {
			const $items = this.$items;

			// READ: To begin with we batch the reads to avoid layout trashing.
			// The first get will most likely cause a reflow.
			const totalWidth = this.offsetWidth;
			const itemHeights = $items.map($item => $item.offsetHeight);

			const spacing = this.spacing;
			const colLock = this.colLock;
			const colCount = getColCount(totalWidth, this.cols, this.maxColWidth);
			const colWidth = getColWidth(totalWidth, spacing, colCount);
			const colHeightMap = createEmptyColHeightMap(colCount);

			// Check whether the amount of columns has changed.
			// If they have changed we need to reorder everything, also if the collock is set to true!
			const reorderCols = colHeightMap.length !== this.currentColHeightMap.length;

			// Set the position for each item
			for (const [i, $item] of $items.entries()) {

				// Find the shortest col (we need to prioritize filling that one) or used the existing (locked) one
				const currentLayout = this.itemCache.get($item);
				const col = colLock && !reorderCols && currentLayout != null ? currentLayout.col : getShortestCol(colHeightMap);

				// Compute the position for the item
				const {left, top} = itemPosition(i, colWidth, spacing, col, colCount, colHeightMap);

				// Check if the layout has changed
				if (currentLayout == null ||
					(currentLayout.colWidth !== colWidth || currentLayout.left !== left || currentLayout.top !== top || currentLayout.col !== col)) {
					this.itemCache.set($item, {left, top, col, colWidth});

					// WRITE: Assign the new position.
					Object.assign($item.style, {
						transform: `translate(${left}px, ${top}px)`,
						width: `${colWidth}px`
					});

					// WRITE: Tell the rest of the world that this element has been distributed
					// But defer it to allow the transformation to be applied first
					if (!$item.hasAttribute(DISTRIBUTED_ATTR)) {
						requestAnimationFrame(() => {
							$item.setAttribute(DISTRIBUTED_ATTR, "");
						});
					}
				}

				// Add the gained height to the height map
				colHeightMap[col] = top + itemHeights[i];
			}

			// WRITE: Set the height of the entire component to the height of the tallest col
			this.style.height = `${tallestColHeight(colHeightMap)}px`;

			// WRITE: Tell the rest of the world that the layout has now been distributed
			if (!this.hasAttribute(DISTRIBUTED_ATTR)) {
				this.setAttribute(DISTRIBUTED_ATTR, "");
			}

			// Store the new heights of the cols
			this.currentColHeightMap = colHeightMap;
		});
	}
}

window.customElements.define("masonry-layout", MasonryLayout);

