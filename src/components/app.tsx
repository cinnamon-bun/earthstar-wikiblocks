import React, { useEffect, useState } from 'react';
import {
    AuthorKeypair,
    //sleep,
    StorageLocalStorage,
    //StorageMemory,
    StorageToAsync,
    ValidatorEs4,
} from 'earthstar';
import { useRoutes, /*Link, useQueryParams*/ } from 'raviger';

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
    ThemeChooserFullScreen,
    ThemeDarkButton,
} from './themeComponents';
import { PageView } from './pageView';

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
const STORAGE = new StorageToAsync(new StorageLocalStorage([ValidatorEs4], WORKSPACE), 500);

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

let routes = {
    '/': () => <div>home</div>,
    '/settings': () => <div>settings</div>,
    '/page/:title': (props: { title: string }) => <h1>page = {props.title}</h1>,
    '/block/:blockid': (props: { blockid: string }) => <h2>block = {props.blockid}</h2>,
};

// make a component around this to fix scroll behavior
export let RouteComponent = () => {
    let routeComponent = useRoutes(routes as any);
    // scroll to top when navigating
    useEffect(() => window.scrollTo(0, 0));
    return routeComponent;
};

/*
export let App = () => {
    return <div>
        <div>navbar</div>
        <Link href="/">home</Link> |{" "}
        <Link href="/settings">settings</Link> |{" "}
        <Link href="/page/:foo">page :foo</Link> |{" "}
        <Link href="/block/block:1234">block block:1234</Link>
        <hr/>
        <RouteComponent />
    </div>
}
*/

//================================================================================

export let Sidebar = () =>
    <div className='sidebar'>
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
                    <div><a href="#a">Recent edits</a></div>
                    <div><a href="#b">All pages</a></div>
                </Stack>
            </Box>
        </div>
        <div className='sidebarStretch' />
        <div className='sidebarSettings'>
            <Box>
                <Stack>
                    <ThemeChooserFullScreen className='sidebarButton' />
                    <ThemeDarkButton className='sidebarButton' />
                </Stack>
            </Box>
        </div>
        <div className='sidebarUser'>
            <Box>
                <div className='legend'>user</div>
                <div>Cinnamon</div>
                <div>@cinn</div>
            </Box>
        </div>
    </div>;

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
                    <PageView page={plantPage} />
                </Box>
            </div>
        </ThemeContext.Provider>
        </WikiLayerContext.Provider>
        </KeypairContext.Provider>
        </StorageContext.Provider>
    );
}
