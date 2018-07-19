export class Utils {
    indexedDB: IDBFactory;
    constructor() {
        this.indexedDB = window.indexedDB || (<any>window).mozIndexedDB || (<any>window).webkitIndexedDB || (<any>window).msIndexedDB;
    }
}
