
export const ALPHA_LO = 'abcdefghijklmnopqrstuvwxyz';
export const ALPHA_UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMS = '0123456789';
export const ALPHANUM = ALPHA_LO + ALPHA_UP + NUMS;

export let randomChar = (str: string): string =>
    str[Math.floor(Math.random() * str.length)];

export let entropyString = (len: number): string =>
    Array(len).fill(0).map(x => randomChar(ALPHANUM)).join('');

let lastTimestamp = 0;
export let monotonicMicroseconds = (): number => {
    let thisTimestamp = Math.max(Date.now() * 1000, lastTimestamp + 1);
    lastTimestamp = thisTimestamp;
    return thisTimestamp;
};

// inclusive of endpoints
export let randInt = (lo: number, hi: number): number =>
    Math.floor(Math.random() * (hi - lo + 1)) + lo;
