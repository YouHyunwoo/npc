import { LibraryDataManagement } from "./base.js";
import { Library } from "../library.js";
import { Quest } from "../quest.js";

const LOCAL_STORAGE_LIBRARY_DATA_KEY = 'npc-guild-library'; // database에서 가져오기

export class LocalStorageLibraryDataManagement extends LibraryDataManagement {

    load() {
        const library = Library.create();

        const libraryDataJSONText = localStorage.getItem(LOCAL_STORAGE_LIBRARY_DATA_KEY);

        const existsLibraryData = libraryDataJSONText != null;
        if (existsLibraryData) {
            const libraryData = JSON.parse(libraryDataJSONText);

            library.quests = libraryData.quests.map(questData => Quest.fromJSON(questData));
        }

        return library;
    }

    save(library) {
        const libraryData = {
            quests: library.quests.map(quest => quest.toJSON()),
        };

        const libraryDataJSONText = JSON.stringify(libraryData);
        localStorage.setItem(LOCAL_STORAGE_LIBRARY_DATA_KEY, libraryDataJSONText);
    }
}