import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private db: IDBDatabase | null = null;

  constructor() {
    this.openDatabase();
  }

  private openDatabase() {
    const request = indexedDB.open('ImageDB', 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      db.createObjectStore('images', { keyPath: 'name' });
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
    };

    request.onerror = (event: any) => {
      console.error('IndexedDB error:', event.target.errorCode);
    };
  }

  async saveImage(name: string, image: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not initialized');

      const transaction = this.db.transaction('images', 'readwrite');
      const store = transaction.objectStore('images');
      const request = store.put({ name, image });

      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(event.target.errorCode);
    });
  }

  async getImage(name: string): Promise<{ name: string, image: string } | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not initialized');

      const transaction = this.db.transaction('images', 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(name);

      request.onsuccess = (event: any) => resolve(event.target.result);
      request.onerror = (event: any) => reject(event.target.errorCode);
    });
  }

  async deleteImage(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not initialized');

      const transaction = this.db.transaction('images', 'readwrite');
      const store = transaction.objectStore('images');
      const request = store.delete(name);

      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(event.target.errorCode);
    });
  }
}
