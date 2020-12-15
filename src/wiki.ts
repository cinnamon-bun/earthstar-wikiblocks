import { AuthorAddress, IStorage, WorkspaceAddress } from 'earthstar';
import {
    entropyString,
    monotonicMicroseconds,
} from './util';

/*
a "page" contains "blocks"
"blocks" can have "comments"

    :owner: can be "common" or ~@suzy.bxxx (or @suzy.bxxx for comments)
    :title: is a percent-encoded string
    :blockId: and :commentId: are timestamps + entropy

    /wikiblocks-v1/:owner:/:title:/:blockId:/text.md  -- markdown text of block
    /wikiblocks-v1/:owner:/:title:/:blockId:/sort.json  -- a float between -1024 and 1024.  lower comes first
    /wikiblocks-v1/:owner:/:title:/:blockId:/comments/:author:/:commentId:/text.md
*/

const APPNAME = 'wikiblocks-v1';

type PageId = string;  // :owner:/:title:
interface ParsedPath {
    kind: 'block-text' | 'block-sort',
    owner: 'common' | AuthorAddress,
    title: string,
    blockId: string,
}

export let makeId = (): string =>
    `${monotonicMicroseconds()}-${entropyString(5)}`;

class WikiLayer {
    storage: IStorage;
    workspace: WorkspaceAddress;
    constructor(storage: IStorage) {
        this.storage = storage;
        this.workspace = this.storage.workspace;
    }
    parsePath(path: string): ParsedPath | null {
        return null;
    }
    //listPages(): PageId[] {
    //    let paths = this.storage.paths({ pathPrefix: `/${APPNAME}/` });
    //    for (let path of paths) {
    //    }
    //}
}
