import { UIPanel, UIRow, UIText } from "../ui.js";

export class MetadataPanel extends UIPanel {

	constructor(reader) {

		super();
		const strings = reader.strings;
		const keys = [
			"sidebar/metadata",
			"sidebar/metadata/creator",
			"sidebar/metadata/description",
			"sidebar/metadata/identifier",
			"sidebar/metadata/language",
			"sidebar/metadata/pubdate",
			"sidebar/metadata/publisher",
			"sidebar/metadata/title"
		];

		const creatorLabel = new UIText(strings.get(keys[1])).setClass("label");
		const creatorValue = new UIText().setClass("value");
		const creatorRow = new UIRow();
		creatorRow.add([creatorLabel, creatorValue]);

		const descriptionLabel = new UIText(strings.get(keys[2])).setClass("label");
		const descriptionValue = new UIText().setClass("value");
		const descriptionRow = new UIRow();
		descriptionRow.add([descriptionLabel, descriptionValue]);

		const identifierLabel = new UIText(strings.get(keys[3])).setClass("label");
		const identifierValue = new UIText().setClass("value");
		const identifierRow = new UIRow();
		identifierRow.add([identifierLabel, identifierValue]);

		const languageLabel = new UIText(strings.get(keys[4])).setClass("label");
		const languageValue = new UIText().setClass("value");
		const languageRow = new UIRow();
		languageRow.add([languageLabel, languageValue]);

		const pubdateLabel = new UIText(strings.get(keys[5])).setClass("label");
		const pubdateValue = new UIText().setClass("value");
		const pubdateRow = new UIRow();
		pubdateRow.add([pubdateLabel, pubdateValue]);

		const publisherLabel = new UIText(strings.get(keys[6])).setClass("label");
		const publisherValue = new UIText().setClass("value");
		const publisherRow = new UIRow();
		publisherRow.add([publisherLabel, publisherValue]);

		const titleLabel = new UIText(strings.get(keys[7])).setClass("label");
		const titleValue = new UIText().setClass("value");
		const titleRow = new UIRow();
		titleRow.add([titleLabel, titleValue]);

		this.setId("metadata");
		this.add([
			creatorRow,
			descriptionRow,
			identifierRow,
			languageRow,
			pubdateRow,
			publisherRow,
			titleRow
		]);

		//-- events --//

		reader.on("metadata", (meta) => {

			document.title = meta.title;

			if (meta.creator) {
				creatorValue.setValue(meta.creator);
				creatorValue.dom.title = meta.creator;
			} else {
				creatorValue.setValue("-");
			}

			if (meta.description) {
				descriptionValue.setValue(meta.description);
				descriptionValue.dom.title = meta.description;
			} else {
				descriptionValue.setValue("-");
			}

			if (meta.identifier) {
				identifierValue.setValue(meta.identifier);
				identifierValue.dom.title = meta.identifier;
			} else {
				identifierValue.setValue("-");
			}

			if (meta.language) {
				languageValue.setValue(meta.language);
				languageValue.dom.title = meta.language;
			} else {
				languageValue.setValue("-");
			}

			if (meta.pubdate) {
				pubdateValue.setValue(meta.pubdate);
				pubdateValue.dom.title = meta.pubdate;
			} else {
				pubdateValue.setValue("-");
			}

			if (meta.publisher) {
				publisherValue.setValue(meta.publisher);
				publisherValue.dom.title = meta.publisher;
			} else {
				publisherValue.setValue("-");
			}

			if (meta.title) {
				titleValue.setValue(meta.title);
				titleValue.dom.title = meta.title;
			} else {
				titleValue.setValue("-");
			}
		});

		reader.on("languagechanged", (value) => {

			creatorLabel.setValue(strings.get(keys[1]));
			descriptionLabel.setValue(strings.get(keys[2]));
			identifierLabel.setValue(strings.get(keys[3]));
			languageLabel.setValue(strings.get(keys[4]));
			pubdateLabel.setValue(strings.get(keys[5]));
			publisherLabel.setValue(strings.get(keys[6]));
			titleLabel.setValue(strings.get(keys[7]));
		});
	}
}
