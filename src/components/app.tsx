import React, { useState } from 'react';
import { createContext, useContext } from 'react';
import {
    AuthorKeypair,
    StorageMemory,
    ValidatorEs4,
} from 'earthstar';
import * as themes from 'base16';

import { log } from '../lib/util';
import {
    Page,
    WikiLayer,
} from '../lib/wikiLayer';
import { PageView } from './pageView';

import './app.css';

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

type Theme = themes.Base16Theme;

let invertTheme = (theme: Theme): Theme => {
    return {
        ...theme,
        base00: theme.base07,
        base01: theme.base06,
        base02: theme.base05,
        base03: theme.base04,
        base04: theme.base03,
        base05: theme.base02,
        base06: theme.base01,
        base07: theme.base00,
    }
};

let themeToCssVars = (theme: themes.Base16Theme, selector: string): string => `
${selector} {
    --base00: ${theme.base00};
    --base01: ${theme.base01};
    --base02: ${theme.base02};
    --base03: ${theme.base03};
    --base04: ${theme.base04};
    --base05: ${theme.base05};
    --base06: ${theme.base06};
    --base07: ${theme.base07};
    --base08: ${theme.base08};
    --base09: ${theme.base09};
    --base0A: ${theme.base0A};
    --base0B: ${theme.base0B};
    --base0C: ${theme.base0C};
    --base0D: ${theme.base0D};
    --base0E: ${theme.base0E};
}
`;

//================================================================================


let allThemes: Theme[] = Object.values(themes).filter(x => x.base00 !== undefined);
let defaultTheme: Theme = themes.railscasts;

let findThemeByName = (name: string): Theme => {
    for (let th of allThemes) {
        if (th.scheme === name) { return th; }
    }
    return defaultTheme;
}

interface ThemeContextType {
    theme: Theme,
    allThemes: Theme[],
    setTheme: (theme: Theme) => void,
    isDark: boolean,
    setIsDark: (x: boolean) => void,
}
const ThemeContext = createContext<ThemeContextType>({
    theme: defaultTheme,
    allThemes: allThemes,
    setTheme: (theme: Theme) => {},
    isDark: true,
    setIsDark: (x: boolean) => {}
});

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
            <div className="app">
                <SetThemeCssVariables />
                <ThemeChooser />
                <ThemeChooserFullScreen />
                <PageView page={plantPage} />
            </div>
        </ThemeContext.Provider>
    );
}

interface ThemeVariablesProps {
    theme?: Theme
    selector?: string,
}
export let SetThemeCssVariables = (props: ThemeVariablesProps) => {
    let { theme, allThemes, setTheme, isDark, setIsDark } = useContext(ThemeContext);
    theme = props.theme || theme;
    if (!isDark) { theme = invertTheme(theme); }
    return <style dangerouslySetInnerHTML={{__html: themeToCssVars(theme, props.selector || ':root')}}></style>;
}

interface ThemeFlagProps {
    theme?: Theme;
    style?: React.CSSProperties;
    onClick?: (e: any) => void;
}
export let ThemeFlag = (props: ThemeFlagProps) => {
    log('ThemeFlag', props.theme?.base00);
    let cls = '';
    let demoText: string | null = null;
    let firstCellStyle: React.CSSProperties = {};
    if (props.theme) {
        cls = 'themeFlag-' + props.theme.scheme.split(' ').join('-');
        demoText = props.theme.scheme;
        firstCellStyle.width = '11ch';
    }
    return (
        <div className={'themeFlag ' + cls} style={props.style || {}} onClick={props.onClick}>
            {props.theme ? <SetThemeCssVariables key={props.theme.base00} theme={props.theme} selector={'.' + cls} /> : null}
            <div
                className="themeFlagStripe"
                style={{ ...firstCellStyle, background: 'var(--base00)', color: 'var(--base07)' }}
            >
                {demoText}
            </div>
            <div className="themeFlagStripe" style={{ background: 'var(--base01)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base02)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base03)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base04)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base05)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base06)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base07)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base08)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base09)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base0A)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base0B)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base0C)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base0D)' }} />
            <div className="themeFlagStripe" style={{ background: 'var(--base0E)' }} />
        </div>
    );
}

export let ThemeChooserFullScreen = () => {
    let [ isShown, setIsShown ] = useState(false);
    let { theme, allThemes, setTheme, isDark, setIsDark } = useContext(ThemeContext);
    let bodyNoScrollCss = `
        body {
            overflow: hidden;
        }
    `;
    log('ThemeChooser', 'isDark', isDark);
    return (
        <div className='themeChooserFullScreen'>
            <button type="button" onClick={e => setIsShown(!isShown)}>Theme</button>
            { !isShown ? null : 
                <div className="themeChooserFullScreenBackdrop"
                    onClick={e => setIsShown(!isShown)}
                >
                    <div className="themeChooserFullScreenPanel"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>
                            Pick a{" "}
                            <button type="button"
                                onClick={e => setIsDark(!isDark)}
                            >
                                {isDark ? 'dark' : 'light'}
                            </button>
                            {" "}theme
                        </h3>
                        {allThemes.map(th => {
                            return <ThemeFlag key={th.scheme} theme={th}
                                onClick={e => { setTheme(th); setIsShown(false); } }
                                />
                        })}
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: bodyNoScrollCss }}></style>
                </div>
            }
        </div>
    );
}

export let ThemeChooser = () => {
    let { theme, allThemes, setTheme, isDark, setIsDark } = useContext(ThemeContext);
    return <div className='themeChooser'>
        <label>
            Theme:
            <select value={theme.scheme} onChange={e => setTheme(findThemeByName(e.target.value))}>
                {allThemes.map(th =>
                    <option key={th.scheme} value={th.scheme}
                        style={{backgroundColor: th.base00, color: th.base07}}
                    >
                        {th.scheme}
                    </option>
                )}
            </select>
        </label>
        <button type="button" onClick={e => setIsDark(!isDark)}>{isDark ? 'dark' : 'light'}</button>
        {/*
        <label>
            <input type="checkbox" checked={!isDark} onChange={e => setIsDark(!e.target.checked)} />
            Dark
        </label>
        */}
        <ThemeFlag />
    </div>;
}
