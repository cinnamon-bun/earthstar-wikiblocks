import React, { useContext } from 'react';

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
    Box,
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

export let ThemeChooser = () => {
    let { theme, allThemes, setTheme, isDark, setIsDark } = useContext(ThemeContext);
    let close = () => {
        // TODO: how to only go back when the previous page is on the same site?
        //window.history.back();
    };
    let sWell: React.CSSProperties = {
        backgroundColor: isDark ? 'black' : 'white',
        borderRadius: 'var(--round-card)',
    };
    return (
        <div className='themeChooser'>
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
                <Box style={sWell}>
                    <ThemeFlag key={theme.scheme} theme={theme}
                        onClick={e => { close(); } }
                        />
                </Box>
                <h3>Other themes</h3>
                <Box style={sWell}>
                    {allThemes.map(th => {
                        return <ThemeFlag key={th.scheme} theme={th}
                            onClick={e => { setTheme(th); close(); } }
                            />
                    })}
                </Box>
            </Stack>
        </div>
    );
}

interface ThemeDarkButtonProps {
    className?: string
}
export let ThemeDarkButton = (props: ThemeDarkButtonProps) => {
    let { isDark, setIsDark } = useContext(ThemeContext);
    return (<>
        <button type="button"
            className={props.className === undefined ? 'buttonHollowFaint' : props.className}
            onClick={(e) => setIsDark(!isDark)}
        >
            {isDark ? 'Dark mode' : 'Light mode'}
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
