import {createContext} from 'react'
import { WikiLayer } from '../lib/wikiLayer';

export let WikiLayerContext = createContext<WikiLayer | null>(null);
