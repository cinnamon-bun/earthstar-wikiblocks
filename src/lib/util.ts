
//================================================================================
// BASIC TYPES

export type Thunk = () => void;

//================================================================================
// DEBUGGING

export let log = (name: string, ...args: any[]) => console.log(name + ' |', ...args);

//================================================================================
// CHARS AND ENTROPY

export const ALPHA_LO = 'abcdefghijklmnopqrstuvwxyz';
export const ALPHA_UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMS = '0123456789';
export const ALPHANUM = ALPHA_LO + ALPHA_UP + NUMS;

export let randomChar = (str: string): string =>
    str[Math.floor(Math.random() * str.length)];

export let entropyString = (len: number): string =>
    Array(len).fill(0).map(x => randomChar(ALPHANUM)).join('');

//================================================================================
// TIME

let _lastTimestamp = 0;
export let monotonicMicroseconds = (): number => {
    let thisTimestamp = Math.max(Date.now() * 1000, _lastTimestamp + 1);
    _lastTimestamp = thisTimestamp;
    return thisTimestamp;
};

export let timestampToHuman = (timestamp: number): string => {
    // works with milliseconds or microseconds.
    if (timestamp > 9999999999999) {
        timestamp /= 1000;
    }
    let d = new Date(timestamp);
    return d.toLocaleString();
}

//================================================================================
// RANDOM NUMBERS

export let interpolate = (lo: number, hi: number, amt: number): number =>
    lo + (hi - lo) * amt

// random integer inclusive of endpoints
export let randInt = (lo: number, hi: number): number =>
    Math.floor(Math.random() * (hi - lo + 1)) + lo;

export let randFloat = (lo: number, hi: number): number =>
    Math.random() * (hi - lo) + lo;

//================================================================================
// SORTING

let _diffSign = <T>(a: T, b: T): number =>
    (a > b) ? 1 : ((a < b) ? -1 : 0);

export let sortBy = <T>(arr: T[], fn: (item: T) => any) : void => {
    arr.sort((a, b) => _diffSign(fn(a), fn(b)));
};

