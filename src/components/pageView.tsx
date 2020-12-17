import React from 'react';
import { Page } from '../lib/wikiLayer';
import { BlockView } from './blockView';

import './pageAndBlocks.css';

export interface PageViewProps {
    page: Page;
}
export let PageView = (props: PageViewProps) => {
    let page = props.page;
    let owner = page.owner === 'common' ? 'anyone can edit' : 'by ' + page.owner.slice(0, 12) + '...';
    return (
        <div className="pageView">
            <h1>{page.title}</h1>
            <div className="owner">{owner}</div>
            <div className="pageBlocks">
                <AddHr/>
                {page.blocks?.map((block) => (
                    <React.Fragment key={block.id}>
                        <BlockView block={block} />
                        <AddHr/>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export let AddHr = () => {
    return (
        <div className="addHr">
            <div className="buttonColumn">
                <button type="button">add</button>
            </div>
            <hr/>
        </div>
    )
}
