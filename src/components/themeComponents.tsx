import React, { useState, useContext } from 'react';

// lib
import {
    Theme,
    findThemeByName,
    invertTheme,
    themeToCssVars,
} from '../lib/theme';

// hooks
import { ThemeContext } from '../hooks/themeContext';

// components
import {
    Stack,
} from './layouts';

// css
import '../css/index.css';
import '../css/theme.css';

//================================================================================
// APPLY CSS VARS

interface ThemeVariablesProps {
    theme?: Theme
    selector?: string,
}
export let SetThemeCssVariables = (props: ThemeVariablesProps) => {
    let { theme, /*allThemes, setTheme,*/ isDark, /*setIsDark*/ } = useContext(ThemeContext);
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
    return (
        <div className='themeChooserFullScreen'>
            <button className='buttonHollowFaint' type="button" onClick={e => setIsShown(!isShown)}>Theme</button>
            { !isShown ? null : 
                <div className="themeChooserFullScreenBackdrop"
                    onClick={e => setIsShown(!isShown)}
                >
                    <div className="themeChooserFullScreenPanel"
                        onClick={e => e.stopPropagation()}
                    >
                        <Stack>
                            <h3>
                                Mode:{" "}
                                <button className='buttonHollowStrong' type="button"
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
                            <div>
                            {allThemes.map(th => {
                                return <ThemeFlag key={th.scheme} theme={th}
                                    onClick={e => { setTheme(th); setIsShown(false); } }
                                    />
                            })}
                            </div>
                        </Stack>
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: bodyNoScrollCss }}></style>
                </div>
            }
        </div>
    );
}

export let ThemeDarkButton = () => {
    let { isDark, setIsDark } = useContext(ThemeContext);
    return (<>
        <button type="button" className="buttonHollowFaint"
            onClick={(e) => setIsDark(!isDark)}
        >
            {isDark ? 'Dark' : 'Light'}
        </button>
        </>
    );
};

export let ThemeDropdown = () => {
    let { theme, allThemes, setTheme, /*isDark, setIsDark*/ } = useContext(ThemeContext);
    return <div className='themeDropdown'>
        <select value={theme.scheme} onChange={e => setTheme(findThemeByName(e.target.value))}>
            {allThemes.map(th =>
                <option key={th.scheme} value={th.scheme}
                    style={{backgroundColor: th.base00, color: th.base07}}
                >
                    {th.scheme}
                </option>
            )}
        </select>
    </div>;
}
