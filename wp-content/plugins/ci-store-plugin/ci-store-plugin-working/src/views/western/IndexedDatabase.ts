import { IWesternProductExt } from './IWestern';
import { IWooCategory, IWooVariable } from './IWoo';

interface IIndexedDbSchema {
  [key: string]: { unique: boolean; primary?: boolean };
}

interface ISchemaConfig {
  version: number;
  primary: string;
  schema?: IIndexedDbSchema;
}

const DB_DEFAULT_SCHEMA = { version: 1, primary: 'id', schema: {} };

const DB_SCHEMAS = {
  wooProducts: {
    version: 2,
    primary: 'id',
    schema: {}
  } as ISchemaConfig,
  wpsProducts: {
    version: 1,
    primary: 'id',
    schema: {}
  } as ISchemaConfig,
  wpsListProducts: {
    version: 1,
    primary: 'id',
    schema: {}
  } as ISchemaConfig
};

export class IndexedDBHandler<T> {
  private dbName: string;
  private db: IDBDatabase | null = null;
  private config: ISchemaConfig = {
    version: 1,
    primary: 'id',
    schema: {}
  };

  constructor(dbName: string, config: ISchemaConfig = DB_DEFAULT_SCHEMA) {
    this.dbName = dbName;
    if (config) Object.assign(this.config, config);
    // console.log(dbName, { config });
    this.openDatabaseIfNeeded();
  }

  private openDatabaseIfNeeded(): Promise<void> {
    if (this.db) {
      // Database is already open, no need to reopen it.
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open(this.dbName, this.config.version);

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error!.name);
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        this.db = (event.target as IDBOpenDBRequest).result;

        // Create an object store (table) to store your data.
        let objectStore: IDBObjectStore;
        try {
          console.log(this.dbName, { keyPath: this.config.primary });
          objectStore = this.db.createObjectStore('myObjectStore', { keyPath: this.config.primary });
        } catch (err) {
          objectStore = request.transaction.objectStore('myObjectStore');
        }
        // sync keys
        const indexNames = [...objectStore.indexNames];

        indexNames.forEach((indexKey) => {
          if (Object.keys(this.config.schema).indexOf(indexKey) === -1) {
            objectStore.deleteIndex(indexKey);
          }
        });

        Object.keys(this.config.schema).forEach((newKey) => {
          if (indexNames.indexOf(newKey) === -1) {
            const e = this.config.schema[newKey];
            objectStore.createIndex(newKey, newKey, e);
          }
        });
      };
    });
  }

  async addData(data: T[]): Promise<void> {
    await this.openDatabaseIfNeeded();

    if (!this.db) {
      throw new Error('Database is not open.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['myObjectStore'], 'readwrite');
      const store = transaction.objectStore('myObjectStore');

      data.forEach((item: T) => {
        // console.log({ item });
        const putRequest = store.put(item);
        // console.log('saved');
        putRequest.onsuccess = () => {
          resolve();
        };
        putRequest.onerror = (event: Event) => {
          reject((event.target as IDBRequest).error!.name);
        };
      });
    });
  }

  async addRow(item: T, key?: IDBValidKey): Promise<void> {
    await this.openDatabaseIfNeeded();

    if (!this.db) {
      throw new Error('Database is not open.');
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['myObjectStore'], 'readwrite');
      const store = transaction.objectStore('myObjectStore');
      const putRequest = store.put(item, key);
      putRequest.onsuccess = () => {
        resolve();
      };
      putRequest.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error!.name);
      };
    });
  }

  async deleteRecordById(id: number): Promise<void> {
    try {
      await this.openDatabaseIfNeeded();

      if (!this.db) {
        throw new Error('Database is not open.');
      }

      const transaction = this.db.transaction(['myObjectStore'], 'readwrite');
      const store = transaction.objectStore('myObjectStore');

      return new Promise((resolve, reject) => {
        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => {
          resolve();
        };

        deleteRequest.onerror = (event: Event) => {
          reject((event.target as IDBRequest).error!.name);
        };
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteAllRecords(): Promise<void> {
    try {
      await this.openDatabaseIfNeeded();

      if (!this.db) {
        throw new Error('Database is not open.');
      }

      const transaction = this.db.transaction(['myObjectStore'], 'readwrite');
      const store = transaction.objectStore('myObjectStore');

      return new Promise((resolve, reject) => {
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
          resolve();
        };

        clearRequest.onerror = (event: Event) => {
          reject((event.target as IDBRequest).error!.name);
        };
      });
    } catch (error) {
      throw error;
    }
  }

  async retrieveData(itemId: number | string): Promise<T | undefined> {
    await this.openDatabaseIfNeeded();

    if (!this.db) {
      throw new Error('Database is not open.');
    }
    // console.log('retrieveData', itemId)

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['myObjectStore'], 'readonly');
      const store = transaction.objectStore('myObjectStore');

      // console.log('retrieveData get', itemId)
      const getRequest = store.get(itemId);
      // console.log('got')

      getRequest.onsuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result);
      };

      getRequest.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error!.name);
      };
    });
  }

  async retrieveDataBy(index: string, value: number | string): Promise<T | undefined> {
    await this.openDatabaseIfNeeded();

    if (!this.db) {
      throw new Error('Database is not open.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['myObjectStore'], 'readonly');
      const store = transaction.objectStore('myObjectStore');

      const getRequest = store.index(index).get(value);

      getRequest.onsuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result);
      };

      getRequest.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error!.name);
      };
    });
  }

  async retrieveAllData(): Promise<T[]> {
    await this.openDatabaseIfNeeded();

    if (!this.db) {
      throw new Error('Database is not open.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['myObjectStore'], 'readonly');
      const store = transaction.objectStore('myObjectStore');
      const data: T[] = [];

      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          data.push(cursor.value);
          cursor.continue();
        } else {
          resolve(data);
        }
      };

      cursorRequest.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error!.name);
      };
    });
  }

  async getRecordCount(): Promise<number> {
    try {
      await this.openDatabaseIfNeeded();

      if (!this.db) {
        throw new Error('Database is not open.');
      }

      const transaction = this.db.transaction(['myObjectStore'], 'readonly');
      const store = transaction.objectStore('myObjectStore');
      const countRequest = store.count();

      return new Promise((resolve, reject) => {
        countRequest.onsuccess = (event: Event) => {
          const count = (event.target as IDBRequest<number>).result;
          resolve(count);
        };

        countRequest.onerror = (event: Event) => {
          reject((event.target as IDBRequest).error!.name);
        };
      });
    } catch (error) {
      throw error;
    }
  }

  closeDatabase(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const wpsProductsIDb = new IndexedDBHandler<Partial<IWesternProductExt>>('wpsProducts');
export const wooProductsIDb = new IndexedDBHandler<Partial<IWooVariable>>('wooProducts');
export const wooCategoriesIDb = new IndexedDBHandler<IWooCategory>('wooCategories');
export const wpsListDb = new IndexedDBHandler<{ cursor: string; nextCursor: string; data: Partial<IWesternProductExt>[] }>('wpsList', { version: 1, primary: 'cursor' });
export const wooListDb = new IndexedDBHandler<{ page: number; totalPages: number; data: Partial<IWooVariable>[] }>('wooList', { version: 1, primary: 'page' });
