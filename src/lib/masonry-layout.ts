import { ColHeightMap, createEmptyColHeightMap, debounce, DEFAULT_COLS, DEFAULT_MAX_COL_WIDTH, DEFAULT_SPACING, DeferredLayout, DISTRIBUTED_CLASS, getBooleanAttribute, getColCount, getColWidth, getMasonryColData, getNumberAttribute, getShortestCol, itemPosition, LAYOUT_DEBOUNCE_MS, MasonryCols, setBooleanAttribute, setMasonryColData, updateHeight } from "./masonry-helpers";

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
			opacity: 0;
		}

		::slotted(*) {
			position: absolute;
		}
		
		/* Show the items after they have been distributed */
		:host(.distributed) {
			opacity: 1;
		}
		
		/* Apply the transition after the items have been distributed */
		:host([transition].distributed) ::slotted([data-masonry-col]) {
			transition: var(--masonry-layout-item-transition);
		}
	</style>
	<slot id="slot"></slot>
`;

export class MasonryLayout extends HTMLElement {

	// A map containing the height for each col
	private currentColHeightMap: ColHeightMap = [];
	private ro: ResizeObserver | undefined = undefined;
	private cancelNextResizeEvent = false;
	private nextAnimationFrame: number | undefined = undefined;

	static get observedAttributes() { return [
		"maxcolwidth",
		"collock",
		"spacing",
		"cols"
	];}

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

		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));

		this.scheduleLayout = this.scheduleLayout.bind(this);
		this.layout = this.layout.bind(this);
		this.didResize = this.didResize.bind(this);
	}

	connectedCallback () {
		this.attachListeners();
	}

	disconnectedCallback () {
		this.detachListeners();
	}

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

	private didResize () {
		if (this.cancelNextResizeEvent) {
			this.cancelNextResizeEvent = false;
			return;
		}

		this.scheduleLayout();
	}

	scheduleLayout () {
		debounce(this.layout, LAYOUT_DEBOUNCE_MS, "layout");
	}

	layout () {
		console.log("#layout");
		const $items = this.$items;
		const totalWidth = this.offsetWidth;

		const colCount = getColCount(totalWidth, this.cols, this.maxColWidth);
		const width = getColWidth(totalWidth, this.spacing, colCount);
		const colHeightMap = createEmptyColHeightMap(colCount);

		// Check whether the amount of columns has changed (then we need to reorder everything!)
		const reorderCols = colHeightMap.length !== this.currentColHeightMap.length;
		if (reorderCols && this.classList.contains(DISTRIBUTED_CLASS)) {
			this.classList.remove(DISTRIBUTED_CLASS);
		}


		// Defer the layout reflex as much as possible
		const deferredLayout: DeferredLayout[] = [];

		// Set the position for each item
		for (const [i, $item] of $items.entries()) {

			// Find the shortest col (we need to prioritize filling that one) or used the locked one
			const currentCol = getMasonryColData($item);
			const col = this.colLock && !reorderCols && currentCol != null ? currentCol : getShortestCol(colHeightMap);

			// Compute the position for the item
			const pos = itemPosition(i, width, this.spacing, col, colCount, colHeightMap);
			deferredLayout.push({...pos, col, $item});

			// Add the gained height to the height map
			colHeightMap[col] = pos.top + $item.offsetHeight;
		}

		// Set styles at once to avoid invalidating the layout (TODO: Schedule the style change to avoid unnecessary repaints)
		if (this.nextAnimationFrame != null) {
			cancelAnimationFrame(this.nextAnimationFrame);
		}

		this.nextAnimationFrame = requestAnimationFrame(() => {
			updateHeight(this, colHeightMap);

			while (deferredLayout.length > 0 && this.nextAnimationFrame != null) {
				const {left, top, col, $item} = deferredLayout.shift()!;

				Object.assign($item.style, {
					transform: `translate(${left}px, ${top}px)`,
					width: `${width}px`
				});

				// Apply the masonry col data before next frame to avoid the item from transitioning
				requestAnimationFrame(() => {
					setMasonryColData($item, col);
				});
			}

			// Tell the rest of the world that the layout has now been distributed
			if (!this.classList.contains(DISTRIBUTED_CLASS)) {
				this.classList.add(DISTRIBUTED_CLASS);
			}
		});

		// Update the height without causing the resize event to trigger a new layout
		this.cancelNextResizeEvent = true;

		// Store the information about the current height of each col
		this.currentColHeightMap = colHeightMap;
	}
}

window.customElements.define("masonry-layout", MasonryLayout);

