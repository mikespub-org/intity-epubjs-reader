import EventEmitter from "event-emitter";

import { Strings } from "./strings.js";
import { Toolbar } from "./toolbar.js";
import { Content } from "./content.js";
import { Sidebar } from "./sidebar.js";
import { NoteDlg } from "./notedlg.js";

export class Reader {

	constructor(bookPath, _options) {

		this.settings = undefined;
		this.isMobile = this.detectMobile();
		this.cfgInit(bookPath, _options);

		this.strings = new Strings(this);
		this.toolbar = new Toolbar(this);
		this.content = new Content(this);
		this.sidebar = new Sidebar(this);
		if (this.settings.controls.annotations) {
			this.notedlg = new NoteDlg(this);
		}

		this.book = undefined;
		this.rendition = undefined;
		this.displayed = undefined;

		this.init();

		window.onbeforeunload = this.unload.bind(this);
		window.onhashchange = this.hashChanged.bind(this);
		window.onkeydown = this.keyboardHandler.bind(this);
		window.onwheel = (e) => {
			if (e.ctrlKey) {
				e.preventDefault();
			}
		};
	}

	/**
	 * Initialize book.
	 * @param {*} bookPath
	 * @param {*} _options
	 */
	init(bookPath, _options) {

		this.emit("viewercleanup");
		this.navItems = {};

		if (arguments.length > 0) {

			this.cfgInit(bookPath, _options);
		}

		this.book = ePub(this.settings.bookPath);
		this.rendition = this.book.renderTo("viewer", {
			manager: this.isMobile ? "continuous" : "default",
			flow: this.settings.flow,
			spread: this.settings.spread.mod,
			minSpreadWidth: this.settings.spread.min,
			width: "100%",
			height: "100%",
			snap: true
		});

		const cfi = this.settings.previousLocationCfi;
		if (cfi) {
			this.displayed = this.rendition.display(cfi);
		} else {
			this.displayed = this.rendition.display();
		}

		this.displayed.then((renderer) => {
			this.emit("displayed", renderer, this.settings);
		});

		this.book.ready.then(() => {
			this.emit("bookready", this.settings);
		}).then(() => {
			this.emit("bookloaded");
		});

		this.book.loaded.metadata.then((meta) => {
			this.emit("metadata", meta);
		});

		this.book.loaded.navigation.then((toc) => {
			this.emit("navigation", toc);
		});

		this.rendition.on("click", (e) => {
			const selection = e.view.document.getSelection();
			if (selection.type !== "Range") {
				this.emit("unselected");
			}
		});

		this.rendition.on("layout", (props) => {
			this.emit("layout", props);
		});

		this.rendition.on("selected", (cfiRange, contents) => {
			this.setLocation(cfiRange);
			this.emit("selected", cfiRange, contents);
		});

		this.rendition.on("relocated", (location) => {
			this.setLocation(location.start.cfi);
			this.emit("relocated", location);
		});

		this.rendition.on("keydown", this.keyboardHandler.bind(this));

		this.on("prev", () => {
			if (this.book.package.metadata.direction === "rtl") {
				this.rendition.next();
			} else {
				this.rendition.prev();
			}
		});

		this.on("next", () => {
			if (this.book.package.metadata.direction === "rtl") {
				this.rendition.prev();
			} else {
				this.rendition.next();
			}
		});

		this.on("languagechanged", (value) => {
			this.settings.language = value;
		});

		this.on("flowchanged", (value) => {
			this.settings.flow = value;
			this.rendition.flow(value);
		});
		
		this.on("spreadchanged", (value) => {
			const mod = value.mod || this.settings.spread.mod;
			const min = value.min || this.settings.spread.min;
			this.settings.spread.mod = mod;
			this.settings.spread.min = min;
			this.rendition.spread(mod, min);
		});

		this.on("styleschanged", (value) => {
			const fontSize = value.fontSize;
			this.settings.styles.fontSize = fontSize;
			this.rendition.themes.fontSize(fontSize + "%");
		});
	}

	/* ------------------------------- Common ------------------------------- */

	defaults(obj) {

		for (let i = 1, length = arguments.length; i < length; i++) {
			const source = arguments[i];
			for (let prop in source) {
				if (obj[prop] === void 0)
					obj[prop] = source[prop];
			}
		}
		return obj;
	}

	uuid() {

		let d = new Date().getTime();
		const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			let r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
		});
		return uuid;
	}

	detectMobile() {

		const matches = [
			/Android/i,
			/BlackBerry/i,
			/iPhone/i,
			/iPad/i,
			/iPod/i,
			/Windows Phone/i,
			/webOS/i
		];
		return matches.some((i) => navigator.userAgent.match(i));
	}

	navItemFromCfi(cfi) {

		const range = this.rendition.getRange(cfi);
		const idref = range.startContainer.parentNode.id;
		const location = this.rendition.currentLocation();
		const href = location.start.href;
		return this.navItems[href + "#" + idref] || this.navItems[href];
	}

	/* ------------------------------ Bookmarks ----------------------------- */

	/**
	 * Verifying the current page in bookmarks.
	 * @param {*} cfi
	 * @returns The index of the bookmark if it exists, or -1 otherwise.
	 */
	isBookmarked(cfi) {

		return this.settings.bookmarks.indexOf(cfi);
	}

	/* ----------------------------- Annotations ---------------------------- */

	isAnnotated(note) {

		return this.settings.annotations.indexOf(note);
	}

	/* ------------------------------ Settings ------------------------------ */

	/**
	 * Initialize book settings.
	 * @param {*} bookPath
	 * @param {*} _options
	 */
	cfgInit(bookPath, _options) {

		this.entryKey = md5(bookPath).toString();
		this.settings = this.defaults(_options || {}, {
			bookPath: bookPath,
			flow: undefined,
			restore: false,
			history: true,
			reload: false, // ??
			bookmarks: undefined,
			annotations: undefined,
			contained: undefined,
			sectionId: undefined,
			spread: undefined,
			styles: undefined,
			pagination: false, // ??
			language: undefined,
			controls: {
				arrows: !this.isMobile,
				openbook: true,
				bookmarks: true,
				annotations: true,
				fullscreen: document.fullscreenEnabled
			}
		});

		if (this.settings.restore && this.isSaved()) {
			this.applySavedSettings();
		}

		if (this.settings.bookmarks === undefined) {
			this.settings.bookmarks = [];
		}

		if (this.settings.annotations === undefined) {
			this.settings.annotations = [];
		}

		if (this.settings.flow === undefined) {
			this.settings.flow = "paginated";
		}

		if (this.settings.spread === undefined) {
			this.settings.spread = {
				mod: "auto",
				min: 800
			};
		}

		if (this.settings.styles === undefined) {
			this.settings.styles = {
				fontSize: 100
			};
		}

		if (this.settings.language === undefined) {
			this.settings.language = "en";
		}
	}

	/**
	 * Checks if the book setting can be retrieved from localStorage.
	 * @returns true if the book key exists, or false otherwise.
	 */
	isSaved() {

		if (!localStorage)
			return false;

		return localStorage.getItem(this.entryKey) !== null;
	}

	/**
	 * Removing the current book settings from local storage.
	 * @returns true if the book settings were deleted successfully, or false
	 * otherwise.
	 */
	removeSavedSettings() {

		if (!this.isSaved())
			return false;

		localStorage.removeItem(this.entryKey);
		return true;
	}

	applySavedSettings() {

		if (!localStorage)
			return false;

		let stored;
		try {
			stored = JSON.parse(localStorage.getItem(this.entryKey));
		} catch (e) { // parsing error of localStorage
			console.exception(e);
		}

		if (stored) {
			// Merge spread
			if (stored.spread) {
				this.settings.spread = this.defaults(this.settings.spread || {}, 
					stored.spread);
			}
			// Merge styles
			if (stored.styles) {
				this.settings.styles = this.defaults(this.settings.styles || {},
					stored.styles);
			}
			if (stored.controls) {
				this.settings.controls = this.defaults(this.settings.controls || {},
					stored.controls);
			}
			// Merge the rest
			this.settings = this.defaults(this.settings, stored);
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Saving the current book settings in local storage.
	 * @returns
	 */
	saveSettings() {

		this.settings.previousLocationCfi = this.rendition.location.start.cfi;
		localStorage.setItem(this.entryKey, JSON.stringify(this.settings));
	}

	setLocation(cfi) {

		const baseUrl = this.book.archived ? undefined : this.book.url;
		const url = new URL(window.location, baseUrl);
		url.hash = "#" + cfi;

		// Update the History Location
		if (this.settings.history && window.location.hash !== url.hash) {
			// Add CFI fragment to the history
			window.history.pushState({}, "", url);
			this.currentLocationCfi = cfi;
		}
	}

	//-- event handlers --//

	unload() {

		if (this.settings.restore && localStorage) {
			this.saveSettings();
		}
	}

	hashChanged() {

		const hash = window.location.hash.slice(1);
		this.rendition.display(hash);
	}

	keyboardHandler(e) {

		const step = 2;
		let value = this.settings.styles.fontSize;

		switch (e.key) {

			case "=":
			case "+":
				value += step;
				this.emit("styleschanged", { fontSize: value });
				break;
			case "-":
				value -= step;
				this.emit("styleschanged", { fontSize: value });
				break;
			case "0":
				value = 100;
				this.emit("styleschanged", { fontSize: value });
				break;
			case "ArrowLeft":
				this.emit("prev");
				break;
			case "ArrowRight":
				this.emit("next");
				break;
		}
	}
}

EventEmitter(Reader.prototype);