import React from 'react';
import { classicNameResolver } from 'typescript';
import { Page } from '../lib/wikiLayer';
import { BlockView } from './blockView';

import './pageAndBlocks.css';

export interface PageViewProps {
    page: Page;
}
export let PageView = (props: PageViewProps) => {
    let page = props.page;
    let owner = page.owner === 'common' ? 'common' : 'by ' + page.owner.slice(0, 12) + '...';
    return (
        <div className="pageView">
            <h1>{page.title}</h1>
            <div className="owner">{owner}</div>
            <div className="pageBlocks">
                <AddHr/>
                {page.blocks?.map((block) => (
                    <>
                    <BlockView key={block.id} block={block} />
                    <AddHr/>
                    </>
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
