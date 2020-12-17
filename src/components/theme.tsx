import React, { useState } from 'react';
import { createContext, useContext } from 'react';
import * as themes from 'base16';

import { log } from '../lib/util';

import './app.css';

//================================================================================
// HELPER FUNCTIONS

export type Theme = themes.Base16Theme;

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
// OUR LIBRARY OF THEMES

export let allThemes: Theme[] = Object.values(themes).filter(x => x.base00 !== undefined);
export let defaultTheme: Theme = themes.railscasts;

let findThemeByName = (name: string): Theme => {
    for (let th of allThemes) {
        if (th.scheme === name) { return th; }
    }
    return defaultTheme;
}

//================================================================================
// CONTEXT

interface ThemeContextType {
    theme: Theme,
    allThemes: Theme[],
    setTheme: (theme: Theme) => void,
    isDark: boolean,
    setIsDark: (x: boolean) => void,
}
export const ThemeContext = createContext<ThemeContextType>({
    theme: defaultTheme,
    allThemes: allThemes,
    setTheme: (theme: Theme) => {},
    isDark: true,
    setIsDark: (x: boolean) => {}
});

//================================================================================
// APPLY CSS VARS

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

//================================================================================
// SHOW PREVIEW OF ONE THEME

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

//================================================================================
//

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
                            Mode:{" "}
                            <button type="button"
                                onClick={e => setIsDark(!isDark)}
                            >
                                {isDark ? 'dark' : 'light'}
                            </button>
                        </h3>
                        <h3>Current theme</h3>
                        <ThemeFlag key={theme.scheme} theme={theme}
                            onClick={e => { setIsShown(false); } }
                            />
                        <h3>Other themes</h3>
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
    </div>;
}
