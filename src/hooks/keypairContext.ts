import { createContext } from 'react'
import { AuthorKeypair } from 'earthstar';

export let KeypairContext = createContext<AuthorKeypair | null>(null);
