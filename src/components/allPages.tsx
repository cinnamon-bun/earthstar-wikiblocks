import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'raviger';

// lib
import { log } from '../lib/util';
import {
    Page,
} from '../lib/wikiLayer';

// hooks
import { WikiLayerContext } from '../hooks/wikiLayerContext';
import { useIsMounted } from '../hooks/useIsMounted';

// components
import {
    Stack,
} from './layouts';

// css
import '../css/index.css';

export let AllPages = () => {
    log('AllPages', '---render---');

    let isMounted = useIsMounted();
    let wiki = useContext(WikiLayerContext);
    let [pages, setPages] = useState<null | Page[]>(null);  // null == loading

    useEffect(() => {
        log('AllPages', 'useEffect: fetching pages...');
        if (wiki === null) { return; }
        wiki.listPages().then(pages => {
            log('AllPages', 'useEffect: ...got pages');
            if (isMounted.current) {
                setPages(pages);
            }
        });
    }, [wiki, isMounted]);

    let pageElems: JSX.Element[] = [];
    if (wiki === null) {
        pageElems.push(<div key='huh'>(no wiki exists?)</div>);
    } else if (pages === null) {
        pageElems.push(<div key='loading'><i>loading...</i></div>);
    } else {
        let prevOwner = '';
        for (let page of pages) {
            if (page.owner !== prevOwner) {
                pageElems.push(
                    <h3 key={`section-${page.owner}`}>
                        {page.owner === 'common' ? page.owner : ('by ' + page.owner.slice(0, 11) + '...')}
                    </h3>
                );
                prevOwner = page.owner
            }
            pageElems.push(
                <div key={`page-${page.owner}-${page.title}}`}
                    style={{marginLeft: 'var(--s0)'}}
                >
                    <Link href={`/page/${page.owner}/${encodeURIComponent(page.title)}`}>
                        {page.title}
                    </Link>
                </div>
            );
        }
    }

    return <Stack>
        <h1>All pages</h1>
        {pageElems}
    </Stack>
}