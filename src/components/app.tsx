import {
    AuthorKeypair,
    StorageMemory,
    ValidatorEs4,
} from 'earthstar';
import {
    Page,
    WikiLayer,
} from '../lib/wikiLayer';
import './app.css';
import { PageView } from './pageView';
import { log } from '../lib/util';

//================================================================================
// setup

log('setup', 'begin');

const KEYPAIR1: AuthorKeypair = {
    address: "@suzy.b7dtlmxswr2tlbpjxuuoofmu55275qduseqzrgb6bh6niab76tzla",
    secret: "br35uewh3bvajzm5g5exmzmt4wzpp7rvyoghwcrrx7l5eqabtmobq"
}
const AUTHOR1 = KEYPAIR1.address;
const WORKSPACE = '+test.abc';

const storage = new StorageMemory([ValidatorEs4], WORKSPACE);
const wiki = new WikiLayer(storage);

let saveBlocks = (wiki: WikiLayer, page: Page, texts: string[]) => {
    for (let blockText of texts) {
        let block = wiki.newBlockInPage(page, AUTHOR1, blockText);
        wiki.saveBlockText(KEYPAIR1, block);
    }
}

let plantPage = wiki.getPage('common', 'Native Plants');
saveBlocks(wiki, plantPage, [
    'Block 1 about plants.',
    'Block 2 about plants.',
    'Block 3 about plants.',
]);
let blogPage = wiki.getPage(AUTHOR1, 'My Blog');
saveBlocks(wiki, blogPage, [
    'Block 1 about my blog.',
    'Block 2 about my blog.',
]);

log('setup', '...done');

plantPage.blocks = wiki.loadPageBlocks(plantPage);
blogPage.blocks = wiki.loadPageBlocks(blogPage);

//================================================================================

export let App = () => {
    return (
        <div className="app">
            <PageView page={plantPage} />
            <PageView page={blogPage} />
        </div>
    );
}
