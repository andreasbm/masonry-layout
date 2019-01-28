export const LAYOUT_DEBOUNCE_MS = 300;
export const MIN_HEIGHT_PRIORITY_SLACK_PX = 10;
export const DISTRIBUTED_ATTR = "data-masonry-distributed";
export const DEFAULT_COLS: MasonryCols = "auto";
export const DEFAULT_MAX_COL_WIDTH = 400;
export const DEFAULT_SPACING = 24;

export type ColHeightMap = number[];
export type MasonryCols = number | "auto";
export type MasonryItemLayout = {top: number, left: number, col: number, colWidth: number};

const DEBOUNCE_MAP: {[id: string]: number} = {};

/**
 * Returns an empty col height map.
 * @param colCount
 */
export function createEmptyColHeightMap (colCount: number): ColHeightMap {
	return Object.assign([...(new Array(colCount))].map(() => 0));
}

/**
 * Returns the width of a col.
 * @param totalWidth
 * @param spacing
 * @param colCount
 */
export function getColWidth (totalWidth: number, spacing: number, colCount: number): number {
	return (totalWidth / colCount) - ((spacing * (colCount - 1)) / colCount);
}

/**
 * Returns the amount of cols that the masonry grid should have.
 * @param totalWidth
 * @param cols
 * @param maxColWidth
 */
export function getColCount (totalWidth: number, cols: MasonryCols, maxColWidth: number): number {
	return isNaN(<number>cols) ? Math.floor(totalWidth / maxColWidth) : <number>cols;
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
 * @param spacing
 * @param colIndex
 * @param colCount
 * @param colHeightMap
 */
export function itemPosition (i: number,
                              width: number,
                              spacing: number,
                              colIndex: number,
                              colCount: number,
                              colHeightMap: ColHeightMap): {top: number, left: number} {

	// Compute the left offset of the item
	const left = (width * colIndex) + (spacing * colIndex);

	// Compute the top offset of the item
	const isFirstInRow = i < colCount;
	const top = (colHeightMap[colIndex] || 0) + (isFirstInRow ? 0 : spacing);

	return {top, left};
}

/**
 * Debounces a function.
 * @param cb
 * @param ms
 * @param id
 */
export function debounce (cb: (() => void), ms: number, id: string) {
	const existingTimeout = DEBOUNCE_MAP[id];
	if (existingTimeout) window.clearTimeout(existingTimeout);
	DEBOUNCE_MAP[id] = window.setTimeout(cb, ms);
}

/**
 * Returns the shortest col from the col height map.
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
