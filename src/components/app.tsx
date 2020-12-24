import React, { useContext, useEffect, useState } from 'react';
import {
    AuthorKeypair,
    //sleep,
    StorageLocalStorage,
    //StorageMemory,
    StorageToAsync,
    ValidatorEs4,
} from 'earthstar';
import { useRoutes, Link } from 'raviger';

// lib
import { log } from '../lib/util';
import {
    APPNAME,
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
    //Cluster,
    Stack,
} from './layouts';
import {
    SetThemeCssVariables,
    ThemeChooser,
    ThemeDarkButton,
} from './themeComponents';
import { PageView } from './pageView';
import { AllPages } from './allPages';
import { CreatePage } from './createPage';

// css
import '../css/index.css';
import '../css/app.css';

//================================================================================
// SETUP

log('setup', 'begin');

const KEYPAIR1: AuthorKeypair = {
    address: "@suzy.b7dtlmxswr2tlbpjxuuoofmu55275qduseqzrgb6bh6niab76tzla",
    secret: "br35uewh3bvajzm5g5exmzmt4wzpp7rvyoghwcrrx7l5eqabtmobq"
}
const AUTHOR1 = KEYPAIR1.address;

const WORKSPACE = '+test.abc';
//const STORAGE = new StorageToAsync(new StorageMemory([ValidatorEs4], WORKSPACE), 1);
const STORAGE = new StorageToAsync(new StorageLocalStorage([ValidatorEs4], WORKSPACE), 100);

const WIKI = new WikiLayer(STORAGE);

let saveBlocks = async (wiki: WikiLayer, page: Page, texts: string[]): Promise<void> => {
    for (let blockText of texts) {
        let block = wiki.newBlockInPage(page, AUTHOR1, blockText);
        await wiki.saveBlockText(KEYPAIR1, block);
    }
}

let plantPage = WIKI.getPage('common', 'Native Plants');
let blogPage = WIKI.getPage(AUTHOR1, 'My Blog');
let prepare = async () => {
    let numExistingDocs = (await STORAGE.paths({ pathPrefix: `/${APPNAME}/` })).length;
    console.log('prepare data', `found ${numExistingDocs} existing docs`);
    if (numExistingDocs > 0) { return; }
    log('prepare data', 'saving plant blocks...');
    await saveBlocks(WIKI, plantPage, [
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
    log('prepare data', 'saving blog blocks...');
    await saveBlocks(WIKI, blogPage, [
        'Block 1 about my blog.',
        'Block 2 about my blog.',
    ]);
    log('prepare data', '...done saving blocks');
    //STORAGE._fakeSleepTime = 500;
}
prepare();

/*
let setForever = async (wiki: WikiLayer, page: Page) => {
    let block = wiki.newBlockInPage(page, AUTHOR1, 'hello');
    let ii = 0;
    while (true) {
        ii += 1;
        block = {...block, text: 'iteration ' + ii};
        await sleep(2000);
        await wiki.saveBlockText(KEYPAIR1, block);
    }
};
setForever(WIKI, plantPage);
*/

log('setup', '...done');

//================================================================================
// ROUTING

export let RecentEdits = () =>
    <Stack>
        <h1>Recent edits</h1>
        <div>Coming soon</div>
    </Stack>;

let routes = {
    '/': () => <AllPages />,
    '/themes': () => <ThemeChooser />,
    '/pages/all': () => <AllPages />,
    '/pages/recent': () => <RecentEdits />,
    '/pages/create': () => <CreatePage />,
    '/page/:owner/:title': (props: { owner: string, title: string }) => {
        let title = decodeURIComponent(props.title);
        let page = WIKI.getPage(props.owner, title);
        return <PageView page={page} />
    },
};

// make a component around this to fix scroll behavior
export let RouteComponent = () => {
    let routeComponent = useRoutes(routes as any);
    // scroll to top when navigating
    useEffect(() => window.scrollTo(0, 0));
    return routeComponent;
};

//================================================================================

export let Sidebar = () => {
    let keypair = useContext(KeypairContext);

    return <div className='sidebar'>
        <div className='sidebarWorkspace'>
            <Box>
                <div className='legend'>workspace</div>
                <select>
                    <option>+gardening.abc</option>
                    <option>+sailing.xyz</option>
                </select>
            </Box>
        </div>
        <div className='sidebarNav'>
            <Box>
                <Stack>
                    <div><Link href='/pages/all'>All pages</Link></div>
                    <div><Link href='/pages/recent'>Recent edits</Link></div>
                    <div><Link href='/pages/create'>Create page</Link></div>
                </Stack>
            </Box>
        </div>
        <div className='sidebarStretch' />
        <div className='sidebarSettings'>
            <Box>
                <Stack>
                    <div><Link href='/themes'>Themes</Link></div>
                    <ThemeDarkButton className='sidebarButton' />
                </Stack>
            </Box>
        </div>
        <div className='sidebarUser'>
            <Box>
                <div className='legend'>user</div>
                {keypair === null
                ? <div>Guest</div>
                : <div>
                        <div>Suzy</div>
                        <div><code title={keypair.address}>{keypair.address.slice(0, 11) + '...'}</code></div>
                    </div>
                }
            </Box>
        </div>
    </div>
}

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
        <ThemeContext.Provider value={initialThemeValue}>
            <SetThemeCssVariables />
            <div className="app">
                <Sidebar />
                <Box className='mainPanel'>
                    <RouteComponent />
                </Box>
            </div>
        </ThemeContext.Provider>
        </WikiLayerContext.Provider>
        </KeypairContext.Provider>
        </StorageContext.Provider>
    );
}
