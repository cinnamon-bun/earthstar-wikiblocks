import {
    isBlockId,
    makeBlockId,
    makeBareId,
    isNonBareId,
    DocRoute,
    pathToRoute,
    routeToPath,
    isBareId,
    getIdKind,
    idToTimestamp,
} from './wikiLayer';

const AUTHOR1 = '@suzy.b7oko5hccyottytekyt7fhittx6aeyvfi4zxgiogsbnsw327w5psq';

describe('ids', () => {
    let id1 = makeBareId();
    let id2 = makeBareId();
    let anyId1 = 'any:' + id1;
    let blockId1 = 'block:' + id1;
    test('basic id properties: length and uniqueness', () => {
        expect(id1.length).toStrictEqual(22);
        expect(id1.split('-').length).toBe(2);
        expect(id1).not.toStrictEqual(id2);
    });
    test('id monotonic increase', () => {
        expect(id1 < id2).toBeTruthy();
        let timestamp1 = id1.split('-')[0];
        let timestamp2 = id2.split('-')[0];
        expect(timestamp1).not.toStrictEqual(timestamp2);
    });
    test('is___Id', () => {
        let badIds = 'a a: a:1 1-2'.split(' ');
        for (let badId of badIds) {
            expect(isBareId(badId)).toBeFalsy();
            expect(isNonBareId(badId)).toBeFalsy();
            expect(isBlockId(badId)).toBeFalsy();
        }

        expect(isBareId(id1)).toBeTruthy();
        expect(isBareId(anyId1)).toBeFalsy();
        expect(isBareId(blockId1)).toBeFalsy();

        expect(isNonBareId(id1)).toBeFalsy();
        expect(isNonBareId(anyId1)).toBeTruthy();
        expect(isNonBareId(blockId1)).toBeTruthy();

        expect(isBlockId(id1)).toBeFalsy();
        expect(isBlockId(anyId1)).toBeFalsy();
        expect(isBlockId(blockId1)).toBeTruthy();
    });
    test('getIdKind', () => {
        expect(getIdKind(id1)).toBeNull();
        expect(getIdKind(anyId1)).toStrictEqual('any');
        expect(getIdKind(blockId1)).toStrictEqual('block');
    });
    test('idToTimestamp', () => {
        let id5 = '1608062676116000-tTWPP';
        let blockId5 = 'block:1608062676116000-tTWPP';
        let timestamp = 1608062676116000;
        expect(idToTimestamp(id5)).toStrictEqual(timestamp);
        expect(idToTimestamp(blockId5)).toStrictEqual(timestamp);
    });
    let blockId8 = makeBlockId();
    test('makeBlockid', () => {
        expect(blockId8.startsWith('block:')).toBeTruthy();
    });
    test('isBlockId', () => {
        expect(isBlockId(blockId8)).toBeTruthy();
        expect(isBlockId('x')).toBeFalsy();
    });
});

describe('path <--> route', () => {
    let vectors: { path: string, route: DocRoute | string }[] = [
        {
            path: '/wikiblocks-v1/common/Hello/block:1608061261524003-tIIQ8/text.md',
            route: { kind: 'block', owner: 'common', title: 'Hello', id: 'block:1608061261524003-tIIQ8', filename: 'text.md' },
        },
        {
            path: '/wikiblocks-v1/common/Hello%20There/block:1608061261524003-tIIQ8/text.md',
            route: { kind: 'block', owner: 'common', title: 'Hello There', id: 'block:1608061261524003-tIIQ8', filename: 'text.md' },
        },
        {
            path: `/wikiblocks-v1/~${AUTHOR1}/Hello/block:1608061261524003-tIIQ8/text.md`,
            route: { kind: 'block', owner: AUTHOR1, title: 'Hello', id: 'block:1608061261524003-tIIQ8', filename: 'text.md' },
        },
        {
            path: '/a',
            route: 'wrong number of slashes',
        },
        {
            path: '/todo/common/Hello/block:1608061261524003-tIIQ8/text.md',
            route: 'appname is not wikiblocks-v1',
        },
        {
            path: '/wikiblocks-v1/x/Hello/block:1608061261524003-tIIQ8/text.md',
            route: 'expected ~@author or "common" in second part of path',
        },
        {
            path: '/wikiblocks-v1/common/Hello%%%%/block:1608061261524003-tIIQ8/text.md',
            route: 'title could not be percent-decoded',
        },
        {
            path: '/wikiblocks-v1/common/Hello/block:1608061261524003-tIIQ8/unknown.file',
            route: 'unknown.file is not an expected filename for a block',
        },
        {
            path: '/wikiblocks-v1/common/Hello/1608061261524003-tIIQ8/text.md',
            route: 'unexpected id: 1608061261524003-tIIQ8',
        },
        {
            path: '/wikiblocks-v1/common/Hello/weird:1608061261524003-tIIQ8/text.md',
            route: 'unexpected id: weird:1608061261524003-tIIQ8',
        },
    ];
    test('pathToRoute', () => {
        for (let { route, path } of vectors) {
            expect(pathToRoute(path)).toStrictEqual(route);
        }
    });
    test('routeToPath', () => {
        for (let { route, path } of vectors) {
            if (typeof route !== 'string') {
                expect(path).toStrictEqual(routeToPath(route));
            }
        }
    });
    test('roundtrips: route -> path -> route -> path', () => {
        for (let { route, path } of vectors) {
            if (typeof route === 'string') { continue; }
            let path2 = routeToPath(route);
            let path3 = pathToRoute(path2) as DocRoute;
            let path4 = routeToPath(path3);
            expect(typeof path3).not.toStrictEqual('string');
            expect(route).toEqual(path3);
            expect(path2).toStrictEqual(path4);
        }
    });
});