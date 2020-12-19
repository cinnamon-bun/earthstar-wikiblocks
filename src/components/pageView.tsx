import React, { useContext, useEffect, useState } from 'react';

// lib
import { log } from '../lib/util';
import { Page, Block } from '../lib/wikiLayer';

// hooks
import { WikiLayerContext } from '../hooks/wikiLayerContext';

// components
import { Stack } from './layouts';
import { BlockView } from './blockView';

// css
import '../css/index.css';
import '../css/pageAndBlocks.css';

//================================================================================

export interface PageViewProps {
    page: Page;
}
export let PageView = (props: PageViewProps) => {
    let page = props.page;
    let owner = page.owner === 'common' ? 'anyone can edit' : 'by ' + page.owner.slice(0, 12) + '...';

    let wiki = useContext(WikiLayerContext);
    let [blocks, setBlocks] = useState<Block[]>([]);
    useEffect(() => {
        if (wiki === null) { return; }
        let unsub = wiki.streamPageBlocks(page, (blocks) => {
            setBlocks(blocks)
        });
        return unsub;
    }, [wiki, page]);

    // Make alternating list of AddBlock and BlockView components.
    // Assume blocks are already sorted
    //  and interpolate sort values between them for the AddBlock components
    let items = [];
    if (blocks.length) {
        let firstBlock = blocks[0];
        let lastBlock = blocks[blocks.length-1];
        let sort0 = firstBlock.sort || firstBlock.creationTimestamp;
        let firstSort = sort0 * 0.75;
        items.push(<AddBlock key='first-add' sort={firstSort} />);
        items.push(<BlockView key='first-block' block={firstBlock} />);
        for (let ii = 0; ii < blocks.length - 1; ii++) {
            let block0 = blocks[ii];
            let block1 = blocks[ii + 1];
            let sort0 = block0.sort || block0.creationTimestamp;
            let sort1 = block1.sort || block1.creationTimestamp;
            items.push(<AddBlock key={'add-' + ii} sort={(sort0 + sort1) / 2}/>);
            items.push(<BlockView key={'block-' + ii} block={block1} />);
        }
        let sort1 = lastBlock.sort || lastBlock.creationTimestamp;
        let lastSort = Math.max(sort1 + 10000, Date.now() * 1000);
        items.push(<AddBlock key='last-add' sort={lastSort} />);
    } else {
        items = [
            <AddBlock key='a' sort={Date.now() * 1000}/>,
        ];
    }

    return (
        <Stack className="pageView">
            <h1 className="pageTitle">{page.title}</h1>
            <div className="owner">{owner}</div>
            <div className="pageBlocks">
                {items}
            </div>
        </Stack>
    );
};

export interface AddBlockProps {
    sort: number;
}
export let AddBlock = (props: AddBlockProps) => {
    return (
        <div className="addBlock"
            onClick={() => log('AddBlock', 'clicked.  sort =', props.sort)}
        >
            <div className="buttonColumn">
                <button type="button">add</button>
            </div>
            <hr />
        </div>
    );
};
