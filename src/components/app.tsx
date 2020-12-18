import React, { useState } from 'react';
import {
    AuthorKeypair,
    StorageMemory,
    ValidatorEs4,
} from 'earthstar';

import { log } from '../lib/util';
import {
    Page,
    WikiLayer,
} from '../lib/wikiLayer';
import { PageView } from './pageView';
import {
    SetThemeCssVariables,
    Theme,
    ThemeDropdown,
    ThemeChooserFullScreen,
    ThemeContext,
    allThemes,
    defaultTheme,
    ThemeDarkButton,
} from './theme';

import {
    Stack,
    Box,
    Cluster,
    ClusterSpacer,
    FlexItem,
    FlexRow,
    FlexSpacer,
} from './layouts';

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
    'Block 1 about [plants]().',
`
## Block 2 about plants.

* they are cool
* leaves
* roots??
`,
    'Block 3 about plants. Block 3 about plants. Block 3 about plants. Block 3 about plants. '+
    'Block 3 about plants. Block 3 about plants.\n\nBlock 3 about plants. Block 3 about plants. '+
    'Block 3 about plants. Block 3 about plants.  Block 3 is all about... plants.',
    'Block4 with an image linked using markdown.'+
    '\n\n![img-alt-text](https://images.unsplash.com/photo-1550065180-82c533e847b2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1354&q=80)',
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
        <ThemeContext.Provider value={initialThemeValue}>
            <SetThemeCssVariables />
            <Box>
                <Stack>
                    <Cluster align="right">
                        <ThemeChooserFullScreen />
                        <ThemeDarkButton />
                    </Cluster>
                    <PageView page={plantPage} />
                </Stack>
            </Box>
        </ThemeContext.Provider>
    );
}
