import { Reader } from "./reader.js";
import { Storage } from "./storage.js";

"use strict";

window.ResizeObserver = undefined;
window.onload = function () {

	const storage = new Storage();
	const url = new URL(window.location);
	const path = (window.bookPath !== undefined)
		? window.bookPath
		: ((url.search.length > 0) ? url.searchParams.get("bookPath") : "https://s3.amazonaws.com/moby-dick/");

	storage.init(function () {

		storage.get(function (data) {

			if (data !== undefined && url.search.length === 0) {

				window.reader = new Reader(data, { restore: true });

			} else {

				window.reader = new Reader(path, { restore: true });
			}
		});
	});

	window.storage = storage;
};

export const main = (path, options) => new Reader(path, options || {});
