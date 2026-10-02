export type SigningKey = { key: ArrayBuffer; cert: ArrayBuffer };

type Preferences = { identity: SigningKey; 'trusted-signers': string[] };

let database: Promise<IDBDatabase> | undefined;

function open(): Promise<IDBDatabase> {
	return (database ??= new Promise((resolve, reject) => {
		const request = indexedDB.open('reseam-browser', 1);
		request.onupgradeneeded = () => request.result.createObjectStore('preferences');
		request.onsuccess = () => {
			request.result.onversionchange = () => {
				request.result.close();
				database = undefined;
			};
			resolve(request.result);
		};
		request.onerror = () => {
			database = undefined;
			reject(request.error);
		};
		request.onblocked = () => reject(new Error('Close other Reseam tabs, then reload this page.'));
	}));
}

async function transaction<T>(
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
	const store = (await open())
		.transaction('preferences', mode, { durability: 'strict' })
		.objectStore('preferences');
	return new Promise((resolve, reject) => {
		const request = run(store);
		request.transaction!.oncomplete = () => resolve(request.result);
		request.transaction!.onabort = () =>
			reject(request.transaction!.error ?? new Error('Browser storage did not save'));
	});
}

export function load<K extends keyof Preferences>(key: K): Promise<Preferences[K] | undefined> {
	return transaction('readonly', (store) => store.get(key));
}

export async function save<K extends keyof Preferences>(key: K, value: Preferences[K]) {
	await transaction('readwrite', (store) => store.put(value, key));
}

export async function remove(key: keyof Preferences) {
	await transaction('readwrite', (store) => store.delete(key));
}
