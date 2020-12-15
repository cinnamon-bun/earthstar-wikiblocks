import { AuthorAddress, IStorage, ValidationError, ValidatorEs4, WorkspaceAddress } from 'earthstar';
import {
    entropyString,
    monotonicMicroseconds,
} from './util';

/*
a Page is made of Blocks, which are small chunks of Markdown text.
There are also Comments which are attached to either Pages or Blocks (not sure).
a Page exists if it has at least one Block text.md document.
Pages don't have any documents themselves.
Blocks can be reordered by changing their sort.json document.

paths:

    AUTHOR can be "common" | "~@suzy.bxxx" | "@suzy.bxxx" in the case of comments
    COMMENT_AUTHOR is "~@zzzz.bxxx"
    TITLE is a percent-encoded string, use encodeURIComponent
    BLOCKID and COMMENTID include microsecond timestamps and entropy like "1607997091921015-Gc0r8"

    // blocks
    /wikiblocks-v1/AUTHOR/TITLE/block:BLOCKID/text.md    -- markdown text of block
                                             /sort.json  -- a single float, defaults to current microsecond timestamp, oldest sorts first

    // comment on a block
    /wikiblocks-v1/AUTHOR_NO_TILDE/TITLE/block:BLOCKID/comments/comment:COMMENTID/COMMENT_AUTHOR/text.md

    // comment on the page
    /wikiblocks-v1/AUTHOR_NO_TILDE/TITLE/comment:COMMENTID/COMMENT_AUTHOR/text.md
*/

const APPNAME = 'wikiblocks-v1';

interface Route {
    author: 'common' | AuthorAddress,
    title: string,
    blockId: string,
    filename: string,
}

export let makeId = (): string =>
    `${monotonicMicroseconds()}-${entropyString(5)}`;

const blockIdRegex = /^block:\d{16}-[a-zA-Z0-9]{5}$/;
export let isBlockId = (id: string): boolean => {
    return id.match(blockIdRegex) !== null;
};

let expectedFilenames = [
    'text.md',
    'sort.json',
];
let pathToRoute = (path: string): Route | null => {
    let parts = path.split('/').slice(1);
    if (parts.length !== 5) { return null; }
    let [appname, author, titleWithPct, blockId, filename] = parts;
    if (appname !== APPNAME) { return null; }
    if (author !== 'common' && ValidatorEs4.parseAuthorAddress(author) instanceof ValidationError) { return null; }
    if (!isBlockId(blockId)) { return null; }
    if (expectedFilenames.indexOf(filename) === -1) { return null; }

    let titleNoPct = decodeURIComponent(titleWithPct);

    return { author, title: titleNoPct, blockId, filename };
};
let routeToPath = (route: Route): string =>
    `/${APPNAME}/${route.author}/${encodeURIComponent(route.title)}/${route.blockId}/${route.filename}`;

let route: Route = {
    author: '@suzy.b7oko5hccyottytekyt7fhittx6aeyvfi4zxgiogsbnsw327w5psq',
    title: 'Local birds 🐦',
    blockId: 'block:1607997091921015-Gc0r8',
    filename: 'text.md',
};
let path = routeToPath(route);
let route2 = pathToRoute(path) as Route;
let path2 = routeToPath(route2);
console.log(route);
console.log(path);
console.log(route2);
console.log(path2);
console.log(path === path2);

class WikiLayer {
    storage: IStorage;
    workspace: WorkspaceAddress;
    constructor(storage: IStorage) {
        this.storage = storage;
        this.workspace = this.storage.workspace;
    }
    listPageRoutes(): Route[] {
        return this.storage.paths({ pathPrefix: `/${APPNAME}/` })
            .map(pathToRoute)
            .filter(r => r !== null) as Route[];
    }
}
