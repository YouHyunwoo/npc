import { LocalStorageLibraryDataManagement } from "./local-storage.js";

export class LibraryDataManagementFactory {

    static create({
        dataManagementName,
    }={}) {
        switch (dataManagementName) {
            case 'local-storage':
                return new LocalStorageLibraryDataManagement();
            default:
                throw `Unknown loader name: ${dataManagementName}`;
        }
    }
}