import {
    AuthorAddress,
    AuthorKeypair,
    IStorage,
    ValidatorEs4,
    WorkspaceAddress,
    WriteResult,
    notErr,
} from 'earthstar';

import {
    Thunk,
    entropyString,
    log,
    monotonicMicroseconds,
    sortBy,
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

/* an Id is an optional id kind, a timestamp in microseconds, and some entropy:
 bare id:         "1608062676116000-tTWPP"
 block id:  "block:1608062676116000-tTWPP"
*/
type Id = string;

// a DocRoute holds all the pieces of an Earthstar path
type DocKind = 'block-doc';  // in the future there will also be comment-doc, etc
export interface DocRoute {
    kind: DocKind,
    owner: 'common' | AuthorAddress,
    title: string,
    id: Id,
    filename: string,
}

// a Page is a collection of Blocks
export interface Page {
    kind: 'page',
    owner: 'common' | AuthorAddress,
    title: string,
    blocks?: Block[],
}

// a Block is a single block of markdown text
export interface Block {
    kind: 'block',
    owner: 'common' | AuthorAddress,
    title: string,
    id: Id,
    author: AuthorAddress,
    creationTimestamp: number,  // from id
    editTimestamp: number,  // from Earthstar document timestamp
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

// extract the timestamp from an id
export let idToTimestamp = (id: string): number => {
    if (id.indexOf(':') !== -1) {
        id = id.split(':')[1];
    }
    id = id.split('-')[0];
    return +id;
}

//================================================================================
// ROUTES

// a Block has several Earthstar documents:
let allowedBlockFilenames = [
    'text.md',  // this is the "primary document" that determines if the block exists
    'sort.json',
];

// parse any Earthstar path into a DocRoute, or return error message (as string) on failure
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

// render a DocRoute back into an Earthstar path string
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
        // query Earthstar to list the existing Pages.
        // Pages don't actually have documents, only Blocks do, so
        // this actually queries for Blocks and then returns
        // their deduped Pages.

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

        // TODO: skip empty blocks (deleted ones), but then we have to read the content of all these docs

        // turn doc routes into page objects
        let pages: Page[] = routes.map(r => ({
            kind: 'page',
            owner: r.owner,
            title: r.title,
        }));

        // dedupe pages, which are already sorted by title
        let dedupedPages = [];
        let prev: Page | null = null;
        for (let thisPage of pages) {
            if (prev !== null && prev.owner === thisPage.owner && prev.title === thisPage.title) { continue; }
            dedupedPages.push(thisPage);
            prev = thisPage;
        }
        return dedupedPages;
    }
    getPage(owner: 'common' | AuthorAddress, title: string): Page {
        // generate a page object.  this neither reads nor writes to Earthstar,
        // since pages don't have Earthstar documents (only blocks do).
        return {
            kind: 'page',
            owner: owner,
            title: title,
        }
    }
    newBlockInPage(page: Page, author: AuthorAddress, text: string): Block {
        // generate, but don't save, a new block in the given page.
        if (page.owner !== 'common' && page.owner !== author) {
            throw new Error("can't add a block by one author to a page with a different author");
        }
        let id = makeBlockId();
        let timestamp = idToTimestamp(id);
        return {
            kind: 'block',
            owner: page.owner,
            title: page.title,
            id: id,
            editTimestamp: timestamp,
            creationTimestamp: timestamp,
            author: author,
            text: text,
        }
    }
    saveBlockText(keypair: AuthorKeypair, block: Block): boolean {
        // save the given block's text to Earthstar.
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
        // save the given block's sort value to Earthstar.
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
    loadPageBlocks(page: Page): Block[] {
        // from Earthstar, load a sorted list of the blocks for a given page.
        let baseRoute: DocRoute = {
            kind: 'block-doc',
            owner: page.owner,
            title: page.title,
            // this character is never allowed in Earthstar paths so it's safe to use 
            // as a splitter here
            id: '|',
            filename: 'foo',
        };
        let pathPrefix = routeToPath(baseRoute).split('|')[0];
        let paths = this.storage.paths({ pathPrefix });
        let routes = paths.map(pathToRoute).filter(r => typeof r !== 'string') as DocRoute[];

        // turn routes into blocks
        let blocksById: Record<string, Block> = {};
        // first load the main document, 'text.md'
        for (let route of routes) {
            if (route.filename === 'text.md') {
                let document = this.storage.getDocument(routeToPath(route));
                if (document === undefined) { continue; }
                let block: Block = {
                    kind: 'block',
                    owner: page.owner,
                    title: page.title,
                    id: route.id,
                    author: document.author,
                    creationTimestamp: idToTimestamp(route.id),
                    editTimestamp: document.timestamp,
                    text: document.content,
                }
                blocksById[route.id] = block;
            }
        }
        // then load the sort document only if the text document was already loaded
        for (let route of routes) {
            if (route.filename === 'sort.json') {
                let block = blocksById[route.id];
                if (block === undefined) { continue; }
                let document = this.storage.getDocument(routeToPath(route));
                if (document === undefined) { continue; }
                // content is a string; convert it to a float
                let sort = +document.content;
                if (isNaN(sort)) { continue; } 
                block.sort = sort;
            }
        }

        // sort by sort values if present, otherwise use creation timestamp
        let blocks = Object.values(blocksById);
        sortBy(blocks, block => block.sort ? block.sort : block.creationTimestamp);

        blocks.forEach(b => Object.freeze(b));

        return blocks;
    }
    streamPageBlocks(page: Page, cb: (blocks: Block[]) => void): Thunk {
        // Given a Page, starts a stream of calls to cb with the sorted Blocks in that Page.
        // The first call to cb will happen during the execution of this function.
        // Each later call will send a new array holding all the same Block objects as before,
        //  except any Blocks that have changed will be new objects.
        // Returns an unsub function which stops the stream.

        log('WikiLayer.streamPageBlocks', 'setup starting');

        // cache of blocks
        let blocksById: Record<string, Block> = {};

        // when any change happens in Earthstar...
        let unsub = this.storage.onWrite.subscribe(evt => {
            log('WikiLayer.streamPageBlocks', 'onWrite: got an event...');
            // check if it's an update related to this Page...
            if (evt.kind !== 'DOCUMENT_WRITE') { return; }
            let doc = evt.document;
            let route = pathToRoute(doc.path);
            if (typeof route === 'string') { return; }
            if (route.owner !== page.owner || route.title !== page.title) { return; }
            if (route.kind !== 'block-doc') { return; }

            // it is related to this Page.
            log('WikiLayer.streamPageBlocks', 'onWrite: ...related to this Page...');

            let wasChanged = false;

            // first make sure the Block exists in our cache
            let block: Block = blocksById[route.id];
            if (block === undefined) {
                log('WikiLayer.streamPageBlocks', 'onWrite: ...making new block...');
                block = {
                    kind: 'block',
                    owner: page.owner,
                    title: page.title,
                    id: route.id,
                    author: doc.author,
                    creationTimestamp: idToTimestamp(route.id),
                    editTimestamp: doc.timestamp,
                    text: '',
                }
            } else {
                log('WikiLayer.streamPageBlocks', 'onWrite: ...updating existing block...');
            }

            // update it from the Earthstar doc that just changed
            if (route.filename === 'text.md') {
                log('WikiLayer.streamPageBlocks', 'onWrite: ...with new text content...');
                wasChanged = block.text !== doc.content;
                if (wasChanged) {
                    block = {...block, text: doc.content, editTimestamp: doc.timestamp };
                }
            } else if (route.filename === 'sort.json') {
                log('WikiLayer.streamPageBlocks', 'onWrite: ...with new sort...');
                let sort: number = +doc.content;
                if (!isNaN(sort)) {
                    wasChanged = block.sort !== sort;
                    if (wasChanged) {
                        block = {...block, sort };
                    }
                }
            }
            Object.freeze(block);

            if (!wasChanged) {
                log('WikiLayer.streamPageBlocks', 'onWrite: ...nothing changed, bailing out early.');
                return;
            }

            // save it back to the cache
            blocksById[route.id] = block;

            // generate a new sorted list of blocks...
            let blocks: Block[] = Object.values(blocksById);
            sortBy(blocks, block => block.sort ? block.sort : block.creationTimestamp);

            // skip empty blocks
            blocks = blocks.filter(b => b.text !== '');

            // and send it to the subscriber.
            log('WikiLayer.streamPageBlocks', 'onWrite: ...sending.');
            cb(blocks);
        });

        // kick things off with the initial state and fill the cache
        log('WikiLayer.streamPageBlocks', 'setup: filling cache and returning initial state');
        let blocks = this.loadPageBlocks(page);
        for (let block of blocks) {
            blocksById[block.id] = block;
        }
        
        cb(blocks);

        log('WikiLayer.streamPageBlocks', 'setup complete');
        return unsub;
    }
}
