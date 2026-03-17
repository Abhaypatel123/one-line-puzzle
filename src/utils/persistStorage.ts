import { deleteAsync, documentDirectory, EncodingType, getInfoAsync, makeDirectoryAsync, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import { StateStorage } from 'zustand/middleware';

const storageRoot = documentDirectory ? `${documentDirectory}zustand/` : null;

const getStorageFile = (name: string) => (storageRoot ? `${storageRoot}${name}.json` : null);

const ensureStorageRoot = async () => {
  if (!storageRoot) return;
  const info = await getInfoAsync(storageRoot);
  if (!info.exists) {
    await makeDirectoryAsync(storageRoot, { intermediates: true });
  }
};

export const persistStorage: StateStorage = {
  getItem: async (name) => {
    const fileUri = getStorageFile(name);
    if (!fileUri) return null;
    const info = await getInfoAsync(fileUri);
    if (!info.exists || info.isDirectory) return null;
    return readAsStringAsync(fileUri, { encoding: EncodingType.UTF8 });
  },
  setItem: async (name, value) => {
    const fileUri = getStorageFile(name);
    if (!fileUri) return;
    await ensureStorageRoot();
    await writeAsStringAsync(fileUri, value, { encoding: EncodingType.UTF8 });
  },
  removeItem: async (name) => {
    const fileUri = getStorageFile(name);
    if (!fileUri) return;
    const info = await getInfoAsync(fileUri);
    if (info.exists) {
      await deleteAsync(fileUri, { idempotent: true });
    }
  },
};
