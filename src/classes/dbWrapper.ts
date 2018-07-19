export class DbWrapper {
    dbName: string;
    dbVersion: number;
    db: IDBDatabase;

    constructor(dbName: string, version: number) {
        this.dbName = dbName;
        this.dbVersion = version || 1;
        this.db = null;
    }

    validateStoreName(storeName: string) {
        return this.db.objectStoreNames.contains(storeName);
    }

    validateBeforeTransaction(storeName: string, reject: Function) {
        if (!this.db) {
            reject('You need to use the openDatabase function to create a database before you query it!');
        }
        if (!this.validateStoreName(storeName)) {
            reject(('objectStore does not exists: ' + storeName));
        }
    }

    createTransaction(options: { storeName: string, dbMode: IDBTransactionMode, error: (e: Event) => any, complete: (e: Event) => any, abort?: (e: Event) => any }): IDBTransaction {
        let trans: IDBTransaction = this.db.transaction(options.storeName, options.dbMode);
        trans.onerror = options.error;
        trans.oncomplete = options.complete;
        trans.onabort = options.abort;
        return trans;
    }
}