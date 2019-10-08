export const MIN_HEIGHT_PRIORITY_SLACK_PX = 10;
export const DISTRIBUTED_ATTR = "data-masonry-distributed";
export const DEFAULT_COLS: MasonryCols = "auto";
export const DEFAULT_MAX_COL_WIDTH = 400;
export const DEFAULT_GAP = 24;
export const DEFAULT_DEBOUNCE_MS = 300;

export type ColHeightMap = number[];
export type MasonryCols = number | "auto";
export type MasonryItemLayout = {top: number, left: number, col: number, colWidth: number};

const DEBOUNCE_MAP = new Map<unknown, number>();

/**
 * Returns an empty col height map.
 * @param colCount
 */
export function createEmptyColHeightMap (colCount: number): ColHeightMap {
	return Object.assign([...(new Array(colCount))].map(() => 0));
}

/**
 * Returns the width of a col.
 * The width of the column will be the total width of the element divided by the amount
 * of columns, subtracted with the total amount of gap.
 * @param totalWidth
 * @param gap
 * @param colCount
 */
export function getColWidth (totalWidth: number, gap: number, colCount: number): number {
	return (totalWidth / colCount) - ((gap * (colCount - 1)) / colCount);
}

/**
 * Returns the amount of cols that the masonry grid should have.
 * @param totalWidth
 * @param cols
 * @param maxColWidth
 */
export function getColCount (totalWidth: number, cols: MasonryCols, maxColWidth: number): number {
	return isNaN(<number>cols) ? Math.max(1, Math.floor(totalWidth / maxColWidth)) : <number>cols;
}

/**
 * Sets the height of the component to the height of the tallest col.
 * @param colHeightMap
 */
export function tallestColHeight (colHeightMap: ColHeightMap): number {
	return Object.values(colHeightMap).reduce((acc, height) => Math.max(acc, height), 0);
}

/**
 * Computes the position of an item.
 * @param i
 * @param width
 * @param gap
 * @param colIndex
 * @param colCount
 * @param colHeightMap
 */
export function itemPosition (i: number,
                              width: number,
                              gap: number,
                              colIndex: number,
                              colCount: number,
                              colHeightMap: ColHeightMap): {top: number, left: number} {

	// Compute the left offset of the item. We find the left offset by first computing
	// the width of the columns added together with the gap before the current element.
	const left = (width * colIndex) + (gap * colIndex);

	// If the element in the first row we need to treat it different by not adding  before it.
	const isFirstInRow = i < colCount;

	// The top offset will be the height of the chosen column added together with the gap.
	const top = (colHeightMap[colIndex] || 0) + (isFirstInRow ? 0 : gap);

	return {top, left};
}

/**
 * Debounces a function.
 * @param cb
 * @param ms
 * @param id
 */
export function debounce (cb: (() => void), ms: number, id: unknown) {
	const existingTimeout = DEBOUNCE_MAP.get(id);
	if (existingTimeout) window.clearTimeout(existingTimeout);
	const newTimeout = () => {
		cb();
		DEBOUNCE_MAP.delete(id);
	};
	DEBOUNCE_MAP.set(id, window.setTimeout(newTimeout, ms));
}

/**
 * Returns the shortest col from the col height map. When finding the shortest col we need to subtract
 * a small offset to account for variations in the rounding.
 * @param colHeightMap
 */
export function getShortestCol (colHeightMap: ColHeightMap): number {
	return colHeightMap.map((height: number, col: number) => [col, height]).reduce(
		(shortestColInfo: number[], info: number[]) =>
			shortestColInfo[1] - MIN_HEIGHT_PRIORITY_SLACK_PX <= info[1] ? shortestColInfo : info,
		[0, Number.POSITIVE_INFINITY]
	)[0];
}

/**
 * Sets a boolean attribute on an element.
 * @param $elem
 * @param name
 * @param value
 */
export function setBooleanAttribute ($elem: HTMLElement, name: string, value: boolean) {
	if (value) {
		$elem.setAttribute(name, "");
	} else {
		$elem.removeAttribute(name);
	}
}

/**
 * Returns a boolean attribute from an element.
 * @param $elem
 * @param name
 */
export function getBooleanAttribute ($elem: HTMLElement, name: string): boolean {
	return $elem.hasAttribute(name);
}

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
