import { createContext } from 'react'
import { IStorage } from 'earthstar';

export let StorageContext = createContext<IStorage | null>(null);
