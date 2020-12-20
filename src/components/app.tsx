import React, { useState } from 'react';
import {
    AuthorKeypair,
    StorageMemory,
    ValidatorEs4,
} from 'earthstar';

// lib
import { log } from '../lib/util';
import {
    Page,
    WikiLayer,
} from '../lib/wikiLayer';
import {
    Theme,
    allThemes,
    defaultTheme
} from '../lib/theme';

// hooks
import { KeypairContext } from '../hooks/keypairContext';
import { StorageContext } from '../hooks/storageContext';
import { ThemeContext } from '../hooks/themeContext';
import { WikiLayerContext } from '../hooks/wikiLayerContext';

// components
import {
    Box,
    Cluster,
    Stack,
} from './layouts';
import {
    SetThemeCssVariables,
    ThemeChooserFullScreen,
    ThemeDarkButton,
} from './themeComponents';
import { PageView } from './pageView';

// css
import '../css/index.css';

//================================================================================
// SETUP

log('setup', 'begin');

const KEYPAIR1: AuthorKeypair = {
    address: "@suzy.b7dtlmxswr2tlbpjxuuoofmu55275qduseqzrgb6bh6niab76tzla",
    secret: "br35uewh3bvajzm5g5exmzmt4wzpp7rvyoghwcrrx7l5eqabtmobq"
}
const AUTHOR1 = KEYPAIR1.address;

const WORKSPACE = '+test.abc';
const STORAGE = new StorageMemory([ValidatorEs4], WORKSPACE);

const WIKI = new WikiLayer(STORAGE);

let saveBlocks = (wiki: WikiLayer, page: Page, texts: string[]) => {
    for (let blockText of texts) {
        let block = wiki.newBlockInPage(page, AUTHOR1, blockText);
        wiki.saveBlockText(KEYPAIR1, block);
    }
}

let plantPage = WIKI.getPage('common', 'Native Plants');
saveBlocks(WIKI, plantPage, [
    'Block 1 about [plants]().',
`
## Block 2 about plants.

* they are cool
* leaves
* roots??
`,
    'Block 3 about plants. Block 3 about plants. Block 3 about plants. Block 3 about plants. '+
    'Block 3 about plants. Block 3 about plants.\n\nBlock 3 about plants. Block 3 about plants. '+
    '\n## h2\n'+
    '\n## h2\n'+
    'Block 3 about plants. Block 3 about plants.  Block 3 is all about... plants.',
    'Block4 with an image linked using markdown.'+
    '\n\n![img-alt-text](https://images.unsplash.com/photo-1550065180-82c533e847b2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1354&q=80)',
]);
let blogPage = WIKI.getPage(AUTHOR1, 'My Blog');
saveBlocks(WIKI, blogPage, [
    'Block 1 about my blog.',
    'Block 2 about my blog.',
]);

log('setup', '...done');

plantPage.blocks = WIKI.loadPageBlocks(plantPage);
blogPage.blocks = WIKI.loadPageBlocks(blogPage);

//================================================================================

export let App = () => {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [isDark, setIsDark] = useState(true);
    let initialThemeValue = {
        theme,
        allThemes,
        setTheme,
        isDark,
        setIsDark,
    };
    return (
        <StorageContext.Provider value={STORAGE}>
        <KeypairContext.Provider value={KEYPAIR1}>
        <WikiLayerContext.Provider value={WIKI}>
            <Box>
                <Stack>
                    <Cluster align="right">
                        <ThemeContext.Provider value={initialThemeValue}>
                            <SetThemeCssVariables />
                            <ThemeChooserFullScreen />
                            <ThemeDarkButton />
                        </ThemeContext.Provider>
                    </Cluster>
                    <PageView page={plantPage} />
                </Stack>
            </Box>
        </WikiLayerContext.Provider>
        </KeypairContext.Provider>
        </StorageContext.Provider>
    );
}
