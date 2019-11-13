export const DEFAULT_MAX_COL_WIDTH = 400;
export const DEFAULT_COLS = "auto";
export const DEFAULT_DEBOUNCE_MS = 300;
export const DEFAULT_GAP_PX = 24;

export const COL_COUNT_CSS_VAR_NAME = `--_masonry-layout-col-count`;
export const GAP_CSS_VAR_NAME = `--_masonry-layout-gap`;

// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
export const ELEMENT_NODE_TYPE = 1;

export type ColHeightMap = number[];
export type MasonryCols = number | "auto";

const DEBOUNCE_MAP: Map<string, number> = new Map();

/**
 * Returns a number attribute from an element.
 * @param $elem
 * @param name
 * @param defaultValue
 */
export function getNumberAttribute<T> ($elem: HTMLElement, name: string, defaultValue: T): number | T {
	const value = parseFloat($elem.getAttribute(name) || "");
	return isNaN(value) ? defaultValue : value;
}


/**
 * Returns the amount of cols that the masonry grid should have.
 * @param totalWidth
 * @param cols
 * @param maxColWidth
 */
export function getColCount(totalWidth: number, cols: MasonryCols, maxColWidth: number): number {
	return isNaN(cols as number) ? Math.max(1, Math.floor(totalWidth / maxColWidth)) : cols as number;
}

/**
 * Debounces a function.
 * @param cb
 * @param ms
 * @param id
 */
export function debounce(cb: (() => void), ms: number, id: string) {
	const existingTimeout = DEBOUNCE_MAP.get(id);
	if (existingTimeout != null) window.clearTimeout(existingTimeout);
	DEBOUNCE_MAP.set(id, window.setTimeout(cb, ms));
}

/**
 * Returns the index of the column with the smallest height.
 * @param colHeights
 */
export function findSmallestColIndex(colHeights: ColHeightMap) {
	let smallestIndex = 0;
	let smallestHeight = Infinity;
	colHeights.forEach((height, i) => {
		if (height < smallestHeight) {
			smallestHeight = height;
			smallestIndex = i;
		}
	});

	return smallestIndex;
}