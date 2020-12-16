import React from 'react';
import {
    Page,
} from '../lib/wikiLayer';
import { BlockView } from './blockView';

export interface PageViewProps {
    page: Page
}
export let PageView = (props: PageViewProps) => {
    let page = props.page;
    let owner = page.owner === 'common' ? 'common' : 'by ' + page.owner.slice(0,12)+'...';
    return <div style={{background: '#ddd', borderRadius: 5, padding: 10, margin: 10}}>
        <h2>{page.title}</h2>
        <div><i>{owner}</i></div>
        {page.blocks?.map(block =>
            <BlockView key={block.id} block={block} />
        )}
    </div>;
}
