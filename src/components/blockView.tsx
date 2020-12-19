import React, { useState } from 'react';
import { timestampToHuman } from '../lib/util';
import { Block } from '../lib/wikiLayer';
import ReactMarkdown from 'react-markdown'

import './pageAndBlocks.css';

export interface BlockViewProps {
    block: Block;
}
export let BlockView = (props: BlockViewProps) => {
    let [editingText, setEditingText] = useState<string | null>(null);  // null means not editing
    let block = props.block;
    let beginEditing = () => {
        setEditingText(block.text);
    };
    let handleEditingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingText(e.target.value);
    }
    let saveEditing = () => {
        // TODO: save to earthstar
        setEditingText(null);
    };
    let cancelEditing = () => {
        setEditingText(null);
    };
    return (
        <div className="blockRow">
            <div className="buttonColumn">
                {editingText === null
                    ? <button type="button" className='edit' onClick={beginEditing}>edit</button>
                    : <>
                        <button type="button" className='save' onClick={saveEditing}>save</button>
                        <button type="button" className='cancel' onClick={cancelEditing}>cancel</button>
                    </>
                }
            </div>
            <div className="blockContent">
                {editingText === null
                    ? <ReactMarkdown className="markdown">
                        {block.text}
                    </ReactMarkdown>
                    : <textarea value={editingText} onChange={handleEditingChange} />
                }
                {/*
                <div className="details">
                    {block.owner !== 'common' ? null : (
                        <div>by: {block.author.slice(0, 12) + '...'}</div>
                    )}
                    <div>sort: {block.sort ? block.sort : ('' + block.creationTimestamp)}</div>
                    <div>created: {timestampToHuman(block.creationTimestamp)}</div>
                    <div>edited: {timestampToHuman(block.editTimestamp)}</div>
                </div>
                */}
            </div>
        </div>
    );
};
