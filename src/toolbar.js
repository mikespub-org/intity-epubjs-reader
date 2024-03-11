import { UIPanel, UIDiv, UIInput } from "./ui.js";

export class Toolbar {

	constructor(reader) {

		const strings = reader.strings;

		const container = new UIDiv().setId("toolbar");
		const keys = [
			"toolbar/opener",
			"toolbar/openbook",
			"toolbar/openbook/error",
			"toolbar/bookmark",
			"toolbar/fullsceen"
		];

		const start = new UIPanel().setId("start");
		const opener = new UIInput("button").setId("btn-s");
		opener.dom.title = strings.get(keys[0]);
		opener.dom.onclick = () => {

			const isOpen = opener.dom.classList.length > 0;

			reader.emit("sidebaropener", !isOpen);

			if (!isOpen) {
				opener.addClass("open");
			} else {
				opener.removeClass("open");
			}
		};

		start.add(opener);

		const onload = (e) => {

			storage.clear();
			storage.set(e.target.result, () => {
				reader.unload();
				reader.init(e.target.result, { restore: true });
				const url = new URL(window.location.origin);
				window.history.pushState({}, "", url);
			});
		};
		const onerror = (e) => {
			console.error(e);
		};
		const storage = window.storage;
		const end = new UIPanel().setId("end");
		const openbook = new UIInput("file").setId("btn-o");
		openbook.dom.title = strings.get(keys[1]);
		openbook.dom.accept = "application/epub+zip";
		openbook.dom.onchange = (e) => {

			if (e.target.files.length === 0)
				return;

			if (window.FileReader) {

				const fr = new FileReader();
				fr.onload = onload;
				fr.readAsArrayBuffer(e.target.files[0]);
				fr.onerror = onerror;
			} else {
				alert(strings.get(keys[2]));
			}
		};

		end.add(openbook);

		const bookmark = new UIInput("button").setId("btn-b");
		bookmark.dom.title = strings.get(keys[3]);
		bookmark.dom.onclick = (e) => {

			const cfi = this.locationCfi;
			const val = reader.isBookmarked(cfi) === -1;
			reader.emit("bookmarked", val);
		};

		end.add(bookmark);

		let fullscreen = null;
		if (document.fullscreenEnabled) {

			fullscreen = new UIInput("button").setId("btn-f");
			fullscreen.dom.title = strings.get(keys[4]);
			fullscreen.dom.onclick = (e) => {

				this.toggleFullScreen();
			};

			document.onkeydown = (e) => {

				if (e.key === "F11") {
					e.preventDefault();
					this.toggleFullScreen();
				}
			};

			document.onfullscreenchange = (e) => {
				
				const w = window.screen.width === e.target.clientWidth;
				const h = window.screen.height === e.target.clientHeight;

				if (w && h) {
					fullscreen.addClass("resize-small");
				} else {
					fullscreen.removeClass("resize-small");
				}
			};

			end.add(fullscreen);
		}

		container.add([start, end]);
		document.body.appendChild(container.dom);

		//-- events --//

		reader.on("relocated", (location) => {

			const cfi = location.start.cfi;
			const val = reader.isBookmarked(cfi) === -1;
			if (val) {
				bookmark.removeClass("bookmarked");
			} else {
				bookmark.addClass("bookmarked");
			}
			this.locationCfi = cfi; // save location cfi
		});

		reader.on("bookmarked", (boolean) => {

			if (boolean) {
				bookmark.addClass("bookmarked");
			} else {
				bookmark.removeClass("bookmarked");
			}
		});

		reader.on("languagechanged", (value) => {

			opener.dom.title = strings.get(keys[0]);
			openbook.dom.title = strings.get(keys[1]);
			bookmark.dom.title = strings.get(keys[3]);

			if (fullscreen) {
				fullscreen.dom.title = strings.get(keys[4]);
			}
		});
	}

	toggleFullScreen() {

		document.activeElement.blur();

		if (document.fullscreenElement === null) {
			document.documentElement.requestFullscreen();
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	}
}
