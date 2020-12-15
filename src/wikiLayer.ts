import {
    AuthorAddress,
    AuthorKeypair,
    IStorage,
    ValidationError,
    ValidatorEs4,
    WorkspaceAddress,
    notErr,
    WriteResult,
} from 'earthstar';
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

    OWNER can be "common" | "~@suzy.bxxx" | "@suzy.bxxx" in the case of comments
    COMMENT_AUTHOR is "~@zzzz.bxxx"
    TITLE is a percent-encoded string, use encodeURIComponent
    BLOCKID and COMMENTID include microsecond timestamps and entropy like "1607997091921015-Gc0r8"

    // blocks
    /wikiblocks-v1/OWNER/TITLE/block:BLOCKID/text.md    -- markdown text of block
                                             /sort.json  -- a single float, defaults to current microsecond timestamp, oldest sorts first

    // comment on a block
    /wikiblocks-v1/OWNER_NO_TILDE/TITLE/block:BLOCKID/comments/comment:COMMENTID/COMMENT_AUTHOR/text.md

    // comment on the page
    /wikiblocks-v1/OWNER_NO_TILDE/TITLE/comment:COMMENTID/COMMENT_AUTHOR/text.md
*/

export const APPNAME = 'wikiblocks-v1';

//================================================================================
// TYPES

type Id = string;

type DocKind = 'block-doc';
export interface DocRoute {
    kind: DocKind,
    owner: 'common' | AuthorAddress,
    title: string,
    id: Id,
    filename: string,
}

export interface Page {
    kind: 'page',
    owner: 'common' | AuthorAddress,
    title: string,
    blocks?: Block[],
}

export interface Block {
    kind: 'block',
    owner: 'common' | AuthorAddress,
    title: string,
    id: Id,
    author: AuthorAddress,
    sort?: number,  // microsecond float, defaults to timestamp if not set in a document
    text: string,  // markdown
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

// return error message (as string) on failure to parse path
export let pathToRoute = (path: string): DocRoute | string => {
    let parts = path.split('/').slice(1);
    if (parts.length !== 5) { return 'wrong number of slashes'; }
    let [appname, owner, titleWithPct, id, filename] = parts;

    if (appname !== APPNAME) { return `appname is not ${APPNAME}`; }

    // validate author
    if (owner === 'common') { }
    else if (owner.startsWith('~') && notErr(ValidatorEs4.parseAuthorAddress(owner.slice(1)))) { 
        owner = owner.slice(1); // remove tilde
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
    let kind: DocKind = 'block-doc';
    if (isBlockId(id)) {
        kind = 'block-doc';
        if (allowedBlockFilenames.indexOf(filename) === -1) { return `${filename} is not an expected filename for a ${kind}`; }
    } else {
        return `unexpected id: ${id}`;
    }

    return { kind: kind, owner: owner, title: titleNoPct, id, filename };
};

export let routeToPath = (route: DocRoute): string => {
    let auth = route.owner === 'common' ? 'common' : '~' + route.owner;
    return `/${APPNAME}/${auth}/${encodeURIComponent(route.title)}/${route.id}/${route.filename}`;
}

//================================================================================

export class WikiLayer {
    storage: IStorage;
    workspace: WorkspaceAddress;
    constructor(storage: IStorage) {
        this.storage = storage;
        this.workspace = this.storage.workspace;
    }
    listPages(owner?: 'common' | AuthorAddress): Page[] {
        // build path prefix and query the storage
        let pathPrefix = `/${APPNAME}/`;
        if (owner === 'common') {
            pathPrefix += 'common/';
        } else if (owner?.startsWith('@')) {
            pathPrefix += `~${owner}/`;  // put tilde on author address
        }
        let paths = this.storage.paths({ pathPrefix: pathPrefix });

        // parse paths into doc routes
        let routes = paths.map(pathToRoute).filter(r => typeof r !== 'string') as DocRoute[];

        // only keep block-doc text.md routes
        routes = routes.filter(r => r.kind === 'block-doc' && r.filename === 'text.md');

        // turn doc routes into page objects
        let pages: Page[] = routes.map(r => ({
            kind: 'page',
            owner: r.owner,
            title: r.title,
        }));

        // dedupe pages
        let dedupedPages = [];
        let prev: Page | null = null;
        for (let thisPage of pages) {
            if (prev !== null && prev.owner == thisPage.owner && prev.title === thisPage.title) { continue; }
            dedupedPages.push(thisPage);
            prev = thisPage;
        }
        return dedupedPages;
    }
    getPage(owner: 'common' | AuthorAddress, title: string): Page {
        return {
            kind: 'page',
            owner: owner,
            title: title,
        }
    }
    newBlockInPage(page: Page, author: AuthorAddress, text: string): Block {
        if (page.owner !== 'common' && page.owner !== author) {
            throw new Error("can't add a block by one author to a page with a different author");
        }
        return {
            kind: 'block',
            owner: page.owner,
            title: page.title,
            id: makeBlockId(),
            author: author,
            text: text,
        }
    }
    saveBlockText(keypair: AuthorKeypair, block: Block): boolean {
        if (keypair.address !== block.author) {
            throw new Error("can't save block using a different author's keypair");
        }
        let route: DocRoute = {
            kind: 'block-doc',
            owner: block.owner,
            title: block.title,
            id: block.id,
            filename: 'text.md',
        }
        let result = this.storage.set(keypair, {
            format: 'es.4',
            path: routeToPath(route),
            content: block.text,
        });
        return result === WriteResult.Accepted;
    }
    saveBlockSort(keypair: AuthorKeypair, block: Block): boolean {
        if (keypair.address !== block.author) {
            throw new Error("can't save block using a different author's keypair");
        }
        let route: DocRoute = {
            kind: 'block-doc',
            owner: block.owner,
            title: block.title,
            id: block.id,
            filename: 'sort.json',
        }
        let result = this.storage.set(keypair, {
            format: 'es.4',
            path: routeToPath(route),
            content: '' + (block.sort || idToTimestamp(block.id)),
        });
        return result === WriteResult.Accepted;
    }
}
