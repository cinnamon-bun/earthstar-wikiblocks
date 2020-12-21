import { createContext } from 'react'
import { IStorageAsync } from 'earthstar';

export let StorageContext = createContext<IStorageAsync | null>(null);
