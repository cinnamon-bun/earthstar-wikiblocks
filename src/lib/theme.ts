import * as themes from 'base16';

//================================================================================
// TYPES

export type Theme = themes.Base16Theme;

//================================================================================
// OUR LIBRARY OF THEMES

export let allThemes: Theme[] = Object.values(themes).filter(x => x.base00 !== undefined);
export let defaultTheme: Theme = themes.railscasts;

export let findThemeByName = (name: string): Theme => {
    for (let th of allThemes) {
        if (th.scheme === name) { return th; }
    }
    return defaultTheme;
}

//================================================================================
// HELPER FUNCTIONS

export let invertTheme = (theme: Theme): Theme => {
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

export let themeToCssVars = (theme: themes.Base16Theme, selector: string): string => `
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
