import { UITabbedPanel } from "./ui.js";
import { TocPanel } from "./sidebar/toc.js";
import { BookmarksPanel } from "./sidebar/bookmarks.js";
import { AnnotationsPanel } from "./sidebar/annotations.js";
import { SearchPanel } from "./sidebar/search.js";
import { SettingsPanel } from "./sidebar/settings.js";
import { MetadataPanel } from "./sidebar/metadata.js";

export class Sidebar {

	constructor(reader) {

		const strings = reader.strings;
		const keys = [
			"sidebar/contents",
			"sidebar/bookmarks",
			"sidebar/annotations",
			"sidebar/search",
			"sidebar/settings",
			"sidebar/metadata"
		];

		const container = new UITabbedPanel("vertical").setId("sidebar");

		container.addTab("tab-t", strings.get(keys[0]), new TocPanel(reader));
		container.addTab("tab-b", strings.get(keys[1]), new BookmarksPanel(reader));
		container.addTab("tab-n", strings.get(keys[2]), new AnnotationsPanel(reader));
		container.addTab("tab-s", strings.get(keys[3]), new SearchPanel(reader));
		container.addTab("tab-c", strings.get(keys[4]), new SettingsPanel(reader));
		container.addTab("tab-i", strings.get(keys[5]), new MetadataPanel(reader));
		container.select("tab-t");

		document.body.appendChild(container.dom);

		//-- events --//

		reader.on("languagechanged", (value) => {

			container.setLabel("tab-t", strings.get(keys[0]));
			container.setLabel("tab-b", strings.get(keys[1]));
			container.setLabel("tab-n", strings.get(keys[2]));
			container.setLabel("tab-s", strings.get(keys[3]));
			container.setLabel("tab-c", strings.get(keys[4]));
			container.setLabel("tab-i", strings.get(keys[5]));
		});
	}
}
