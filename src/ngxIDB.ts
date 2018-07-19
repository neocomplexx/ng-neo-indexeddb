import { DbWrapper } from './classes/dbWrapper';
import { Utils } from './classes/utils';
import { IndexDetails } from './classes/indexDetails';


export class NgxIDB {
  utils: Utils;
  dbWrapper: DbWrapper;

  constructor(dbName: string, version: number) {
    this.utils = new Utils();
    this.dbWrapper = new DbWrapper(dbName, version);
  }

  openDatabase(version: number, upgradeCallback?: Function) {
    let self = this;
    return new Promise<any>((resolve, reject) => {
      this.dbWrapper.dbVersion = version;
      let request = this.utils.indexedDB.open(this.dbWrapper.dbName, version);
      request.onsuccess = function (e) {
        self.dbWrapper.db = request.result;
        resolve();
      };

      request.onerror = function (e) {
        reject('IndexedDB error: ' + (<any>e.target).errorCode ?
          (<any>e.target).errorCode + ' (' + (<any>e.target).error + ')' :
          (<any>e.target).errorCode);
      };

      if (typeof upgradeCallback === 'function') {
        request.onupgradeneeded = function (e) {
          upgradeCallback(e, self.dbWrapper.db);
        };
      }
    });
  }

  getByKey(storeName: string, key: any) {
    let self = this;
    return new Promise<any>((resolve, reject) => {
      self.dbWrapper.validateBeforeTransaction(storeName, reject);

      let transaction = self.dbWrapper.createTransaction({
        storeName: storeName,
        dbMode: 'readonly',
        error: (e: Event) => {
          reject(e);
        },
        complete: (e: Event) => {
        }
      }),
        objectStore = transaction.objectStore(storeName),
        request: IDBRequest;

      request = objectStore.get(key);
      request.onsuccess = function (event: Event) {
        resolve((<any>event.target).result);
      };
    });
  }

  getAll(storeName: string, keyRange?: IDBKeyRange, indexDetails?: IndexDetails) {
    let self = this;
    return new Promise<any>((resolve, reject) => {
      self.dbWrapper.validateBeforeTransaction(storeName, reject);

      let transaction = self.dbWrapper.createTransaction({
        storeName: storeName,
        dbMode: 'readonly',
        error: (e: Event) => {
          reject(e);
        },
        complete: (e: Event) => {
        }
      }),
        objectStore = transaction.objectStore(storeName),
        result: Array<any> = [],
        request: IDBRequest;
      if (indexDetails) {
        let index = objectStore.index(indexDetails.indexName),
          order = (indexDetails.order === 'desc') ? 'prev' : 'next';
        request = index.openCursor(keyRange, <IDBCursorDirection>order);
      } else {
        request = objectStore.openCursor(keyRange);
      }

      request.onerror = function (e) {
        reject(e);
      };

      request.onsuccess = function (evt: Event) {
        let cursor = (<IDBOpenDBRequest>evt.target).result;
        if (cursor) {
          result.push(cursor.value);
          cursor['continue']();
        } else {
          resolve(result);
        }
      };
    });
  }

  add(storeName: string, value: any, key?: any) {
    let self = this;
    return new Promise<any>((resolve, reject) => {
      self.dbWrapper.validateBeforeTransaction(storeName, reject);

      let transaction = self.dbWrapper.createTransaction({
        storeName: storeName,
        dbMode: 'readwrite',
        error: (e: Event) => {
          reject(e);
        },
        complete: (e: Event) => {
          resolve({ key: key, value: value });
        }
      }),
        objectStore = transaction.objectStore(storeName);

      let request = objectStore.add(value, key);
      request.onsuccess = (evt: any) => {
        key = evt.target.result;
      };
    });
  }

  update(storeName: string, value: any, key?: any) {
    let self = this;
    return new Promise<any>((resolve, reject) => {
      self.dbWrapper.validateBeforeTransaction(storeName, reject);

      let transaction = self.dbWrapper.createTransaction({
        storeName: storeName,
        dbMode: 'readwrite',
        error: (e: Event) => {
          reject(e);
        },
        complete: (e: Event) => {
          resolve(value);
        },
        abort: (e: Event) => {
          reject(e);
        }
      }),
        objectStore = transaction.objectStore(storeName);

      objectStore.put(value, key);
    });
  }

  delete(storeName: string, key: any) {
    let self = this;
    return new Promise<any>((resolve, reject) => {
      self.dbWrapper.validateBeforeTransaction(storeName, reject);

      let transaction = self.dbWrapper.createTransaction({
        storeName: storeName,
        dbMode: 'readwrite',
        error: (e: Event) => {
          reject(e);
        },
        complete: (e: Event) => {
          resolve();
        },
        abort: (e: Event) => {
          reject(e);
        }
      }),
        objectStore = transaction.objectStore(storeName);

      objectStore['delete'](key);
    });
  }

  openCursor(storeName: string, cursorCallback: (evt: Event) => void, keyRange?: IDBKeyRange) {
    let self = this;
    return new Promise<any>((resolve, reject) => {
      self.dbWrapper.validateBeforeTransaction(storeName, reject);

      let transaction = self.dbWrapper.createTransaction({
        storeName: storeName,
        dbMode: 'readonly',
        error: (e: Event) => {
          reject(e);
        },
        complete: (e: Event) => {
          resolve();
        },
        abort: (e: Event) => {
          reject(e);
        }
      }),
        objectStore = transaction.objectStore(storeName),
        request = objectStore.openCursor(keyRange);

      request.onsuccess = (evt: Event) => {
        cursorCallback(evt);
        resolve();
      };
    });
  }

  clear(storeName: string) {
    let self = this;
    return new Promise<any>((resolve, reject) => {
      self.dbWrapper.validateBeforeTransaction(storeName, reject);

      let transaction = self.dbWrapper.createTransaction({
        storeName: storeName,
        dbMode: 'readwrite',
        error: (e: Event) => {
          reject(e);
        },
        complete: (e: Event) => {
          resolve();
        },
        abort: (e: Event) => {
          reject(e);
        }
      }),
        objectStore = transaction.objectStore(storeName);
      objectStore.clear();
      resolve();
    });
  }

  getByIndex(storeName: string, indexName: string, key: any) {
    let self = this;
    return new Promise<any>((resolve, reject) => {
      self.dbWrapper.validateBeforeTransaction(storeName, reject);

      let transaction = self.dbWrapper.createTransaction({
        storeName: storeName,
        dbMode: 'readonly',
        error: (e: Event) => {
          reject(e);
        },
        abort: (e: Event) => {
          reject(e);
        },
        complete: (e: Event) => {
        }
      }),
        objectStore = transaction.objectStore(storeName),
        index = objectStore.index(indexName),
        request = index.get(key);

      request.onsuccess = (event) => {
        resolve((<IDBOpenDBRequest>event.target).result);
      };
    });
  }
}
