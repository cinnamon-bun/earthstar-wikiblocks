import { AuthorAddress, IStorage, notErr, ValidationError, ValidatorEs4, WorkspaceAddress } from 'earthstar';
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

//================================================================================
// TYPES

type Id = string;
type ItemKind = 'block';
export interface DocRoute {
    kind: ItemKind,
    author: 'common' | AuthorAddress,
    title: string,
    id: Id,
    filename: string,
}

//================================================================================
// ID GENERATION

export let makeBareId = (): Id =>
    `${monotonicMicroseconds()}-${entropyString(5)}`;

export let makeBlockId = (): Id =>
    'block:' + makeBareId();

const bareIdRegex = /^\d{16}-[a-zA-Z0-9]{5}$/;
const nonBareIdRegex = /^[a-z]+:\d{16}-[a-zA-Z0-9]{5}$/;
const blockIdRegex = /^block:\d{16}-[a-zA-Z0-9]{5}$/;
export let isBareId = (id: Id): boolean =>
    id.match(bareIdRegex) !== null;
export let isNonBareId = (id: Id): boolean =>
    id.match(nonBareIdRegex) !== null;
export let isBlockId = (id: Id): boolean =>
    id.match(blockIdRegex) !== null;
export let getIdKind = (id: Id): string | null => {
    if (id.indexOf(':') === -1) { return null }
    return id.split(':')[0];
}

export let idToTimestamp = (id: string): number => {
    if (id.indexOf(':') !== -1) {
        id = id.split(':')[1];
    }
    id = id.split('-')[0];
    return +id;
}

//================================================================================
// ROUTES

let allowedBlockFilenames = [
    'text.md',
    'sort.json',
];

export let pathToRoute = (path: string): DocRoute | string => {  // string is an error message
    let parts = path.split('/').slice(1);
    if (parts.length !== 5) { return 'wrong number of slashes'; }
    let [appname, author, titleWithPct, id, filename] = parts;

    if (appname !== APPNAME) { return `appname is not ${APPNAME}`; }

    // validate author
    if (author === 'common') { }
    else if (author.startsWith('~') && notErr(ValidatorEs4.parseAuthorAddress(author.slice(1)))) { 
        author = author.slice(1); // remove tilde
    }
    else { return 'expected ~@author or "common" in second part of path'; }

    // validate title
    let titleNoPct: string;
    try {
        titleNoPct = decodeURIComponent(titleWithPct);
    } catch (err) {
        return "title could not be percent-decoded";
    }

    // assign kind from id
    // and validate filename
    let kind: ItemKind = 'block';
    if (isBlockId(id)) {
        kind === 'block';
        if (allowedBlockFilenames.indexOf(filename) === -1) { return `${filename} is not an expected filename for a ${kind}`; }
    } else {
        return `unexpected id: ${id}`;
    }

    return { kind: kind, author, title: titleNoPct, id, filename };
};

export let routeToPath = (route: DocRoute): string => {
    let auth = route.author === 'common' ? 'common' : '~' + route.author;
    return `/${APPNAME}/${auth}/${encodeURIComponent(route.title)}/${route.id}/${route.filename}`;
}

//================================================================================

class WikiLayer {
    storage: IStorage;
    workspace: WorkspaceAddress;
    constructor(storage: IStorage) {
        this.storage = storage;
        this.workspace = this.storage.workspace;
    }
    listPageRoutes(): DocRoute[] {
        return this.storage.paths({ pathPrefix: `/${APPNAME}/` })
            .map(pathToRoute)
            .filter(r => typeof r !== 'string') as DocRoute[];
    }
}
