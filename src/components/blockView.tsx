import React from 'react';
import { timestampToHuman } from '../lib/util';
import { Block } from '../lib/wikiLayer';

import './pageAndBlocks.css';

export interface BlockViewProps {
    block: Block;
}
export let BlockView = (props: BlockViewProps) => {
    let block = props.block;
    return (
        <div className="blockRow">
            <div className="buttonColumn">
                <button type="button">edit</button>
            </div>
            <div className="blockContent">
                <div>{block.text}</div>
                <div className="details">
                    {block.owner !== 'common' ? null : (
                        <div>by: {block.author.slice(0, 12) + '...'}</div>
                    )}
                    <div>created: {timestampToHuman(block.creationTimestamp)}</div>
                    <div>edited: {timestampToHuman(block.editTimestamp)}</div>
                </div>
            </div>
        </div>
    );
};
