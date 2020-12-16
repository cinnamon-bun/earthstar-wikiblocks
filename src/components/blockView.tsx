import React from 'react';
import { timestampToHuman } from '../lib/util';
import {
    Block,
} from '../lib/wikiLayer';

export interface BlockViewProps {
    block: Block
}
export let BlockView = (props: BlockViewProps) => {
    let block = props.block;
    return <div style={{background: '#eee', borderRadius: 5, padding: 10, margin: 10}}>
        <div>{block.text}</div>
        <div style={{textAlign: 'right', fontSize: '80%', opacity: 0.5, marginTop: 10}}>
            {block.owner !== 'common' ? null :
                <div>by: {block.author.slice(0,12)+'...'}</div>
            }
            <div>created: {timestampToHuman(block.creationTimestamp)}</div>
            <div>edited: {timestampToHuman(block.editTimestamp)}</div>
        </div>
    </div>;
}
