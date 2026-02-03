// IndexedDB utility for storing and managing font files

const DB_NAME = 'HandwritingAppDB';
const DB_VERSION = 1;
const FONT_STORE = 'fonts';

export interface CachedFont {
  id: string;
  name: string;
  data: ArrayBuffer;
  timestamp: number;
}

// Initialize the database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(FONT_STORE)) {
        db.createObjectStore(FONT_STORE, { keyPath: 'id' });
      }
    };
  });
}

// Save a font to IndexedDB
export async function saveFont(name: string, data: ArrayBuffer): Promise<string> {
  const db = await openDB();
  const id = `font_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const font: CachedFont = {
    id,
    name,
    data,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FONT_STORE, 'readwrite');
    const store = transaction.objectStore(FONT_STORE);
    const request = store.add(font);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

// Get all fonts from IndexedDB
export async function getAllFonts(): Promise<CachedFont[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FONT_STORE, 'readonly');
    const store = transaction.objectStore(FONT_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get a specific font by ID
export async function getFont(id: string): Promise<CachedFont | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FONT_STORE, 'readonly');
    const store = transaction.objectStore(FONT_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// Delete a font by ID
export async function deleteFont(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FONT_STORE, 'readwrite');
    const store = transaction.objectStore(FONT_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Clear all fonts
export async function clearAllFonts(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FONT_STORE, 'readwrite');
    const store = transaction.objectStore(FONT_STORE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
