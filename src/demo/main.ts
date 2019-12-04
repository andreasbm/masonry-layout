import { DEFAULT_COLS, DEFAULT_GAP_PX, DEFAULT_MAX_COL_WIDTH } from "../lib/masonry-helpers";
import { MasonryLayout } from "../lib/masonry-layout";
import "../lib/masonry-layout";

const $masonry = document.querySelector<MasonryLayout>("#masonry")!;
const INITIAL_ITEMS_COUNT = 100;
const SHOW_IMAGES = INITIAL_ITEMS_COUNT <= 100;

const $addButton = document.querySelector<HTMLButtonElement>("#add_button")!;
const $colCountButton = document.querySelector<HTMLButtonElement>("#col_count_button")!;
const $gapButton = document.querySelector<HTMLButtonElement>("#gap_button")!;
const $maxColWidthButton = document.querySelector<HTMLButtonElement>("#max_col_width_button")!;

/**
 * Returns a random height.
 */
function randomHeight (): number {
	return randomNumberInRange(50, 600);
}

/**
 * Returns a random number within a range (included).
 * @param from
 * @param to
 */
function randomNumberInRange (from: number, to: number): number {
	return Math.floor(Math.random() * (to - from + 1)) + from;
}

/**
 * Returns a random color.
 */
function randomColor (): string {
	const list = ["red", "green", "brown", "yellow", "blue", "orange", "cyan", "pink", "black", "grey"];
	return list[randomNumberInRange(0, list.length - 1)];
}

/**
 * Returns a random image source.
 */
function randomImage () {
	return `https://picsum.photos/${randomNumberInRange(500, 550)}`;
}

/**
 * Returns a random item.
 */
function randomItem () {
	return {
		color: randomColor(),
		height: randomHeight(),
		image: randomImage()
	};
}

/**
 * Updates the height of an item.
 * @param $item
 */
function updateHeight ($item: HTMLImageElement) {
	$item.style.height = `${randomHeight()}px`;
	$masonry.layout();
}

/**
 * Adds a new item to the dom.
 */
function addNewItem (): HTMLImageElement {
	const item = randomItem();

	const $item: HTMLImageElement = document.createElement("img");
	$item.classList.add("item");
	$item.setAttribute("loading", "lazy");
	$item.style.height = `${item.height}px`;

	if (SHOW_IMAGES) {
		$item.src = item.image;
	} else {
		$item.style.backgroundColor = item.color;
	}

	$masonry.appendChild($item);
	$item.addEventListener("click", () => updateHeight($item));

	return $item;
}

/**
 * Initializes the demo.
 */
function initialize () {
	for (let i = 0; i < INITIAL_ITEMS_COUNT; i++) {
		addNewItem();
	}
}

$addButton.addEventListener("click", () => {
	addNewItem();
	setTimeout(() => {
		window.scrollTo(0, document.body.scrollHeight);
	}, 100);
});

$colCountButton.addEventListener("click", () => {
	const res = prompt(`Enter the amount of columns (default value is '${DEFAULT_COLS}')`) || "";
	$masonry.cols = isNaN(<any>res) ? DEFAULT_COLS : Math.max(0, Math.min(parseInt(res), 30));
});

$gapButton.addEventListener("click", () => {
	const res = prompt(`Enter the gap size in pixels (default value is '${DEFAULT_GAP_PX}')`) || "";
	$masonry.gap = isNaN(<any>res) ? DEFAULT_GAP_PX : parseInt(res);
});

$maxColWidthButton.addEventListener("click", () => {
	const res = prompt(`Enter the max col width in pixels (default value is '${DEFAULT_MAX_COL_WIDTH}')`) || "";
	$masonry.maxColWidth = isNaN(<any>res) ? DEFAULT_MAX_COL_WIDTH : parseInt(res);
});

initialize();
