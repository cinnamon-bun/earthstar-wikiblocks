import {
    monotonicMicroseconds,
    sortBy,
    randFloat,
    randInt,
    entropyString,
} from './util';

test('entropyString', () => {
    for (let ii = 0; ii < 10; ii++) {
        expect(entropyString(5).length).toBe(5);
    }
});

describe('monotonicMicroseconds', () => {
    test('is in microseconds, not milliseconds', () => {
        let monotonicNow = monotonicMicroseconds() / 1000;
        // should be within, say, 10 seconds of Date.now()
        expect(Math.abs(monotonicNow - Date.now())).toBeLessThan(10 * 1000);
    });
    test('is indeed monotonic', () => {
        let prev = monotonicMicroseconds();
        let start = Date.now();
        while (Date.now() - start < 30) {
            let now = monotonicMicroseconds();
            expect(now).toBeGreaterThan(prev);
            prev = now;
        }
    });
});

test('randInt', () => {
    for (let ii = 0; ii < 100; ii++) {
        let n = randInt(2, 4);
        expect(n).toBeGreaterThanOrEqual(2);
        expect(n).toBeLessThanOrEqual(4);
    }
});

test('randFloat', () => {
    for (let ii = 0; ii < 100; ii++) {
        let n = randFloat(2, 4);
        expect(n).toBeGreaterThanOrEqual(2);
        expect(n).toBeLessThanOrEqual(4);
    }
});

describe('sortBy', () => {
    test('basic test', () => {
        let n = [1, 45, 3, 7];
        sortBy(n, x => x);
        expect(n).toStrictEqual([1, 3, 7, 45]);
    });

    test('use the function', () => {
        // sort by second character
        let items = ['1a', '7b', '7x', '7f', '2c'];
        sortBy(items, i => i[1]);
        expect(items).toStrictEqual(
            ['1a', '7b', '2c', '7f', '7x']
        );
    });

    // js sort is not stable, lol
    //test('sort is stable', () => {
    //    let items = ['1a', '7b', '7x', '7f', '2c'];
    //    sortBy(items, i => i[0]);
    //    expect(items).toStrictEqual(
    //        ['1a', '2c', '7b', '7x', '7f']
    //    );
    //});
});
