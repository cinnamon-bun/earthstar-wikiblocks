import React, { useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown'

// lib
//import { timestampToHuman } from '../lib/util';
import { Block } from '../lib/wikiLayer';

// hooks
import { WikiLayerContext } from '../hooks/wikiLayerContext';
import { KeypairContext } from '../hooks/keypairContext';

// components

// css
import '../css/index.css';
import '../css/pageAndBlocks.css';

//================================================================================

export interface BlockViewProps {
    block: Block;
}
export let BlockView = (props: BlockViewProps) => {
    let wiki = useContext(WikiLayerContext);
    let keypair = useContext(KeypairContext);

    let [editingText, setEditingText] = useState<string | null>(null);  // null means not editing
    let block = props.block;

    //--------------------------------------------------
    let beginEditing = () => {
        setEditingText(block.text);
    };
    let handleEditingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingText(e.target.value);
    }
    let saveEditing = () => {
        if (editingText !== null && keypair !== null && wiki !== null) {
            //// HACK until we can get notified by the wikiLayer that a change has happened
            //block.text = editingText.trim();
            wiki.saveBlockText(keypair, {...block, text: editingText.trim()});
        }
        setEditingText(null);
    };
    let cancelEditing = () => {
        setEditingText(null);
    };

    //--------------------------------------------------
    let actionButtons: JSX.Element[] = [];
    if (keypair !== null) {
        if (editingText === null) {
            actionButtons = [
                <button key='edit' type="button" className='edit' onClick={beginEditing}>edit</button>,
            ];
        } else {
            actionButtons = [
                <button key='save'   type="button" className='save' onClick={saveEditing}>save</button>,
                <button key='cancel' type="button" className='cancel' onClick={cancelEditing}>cancel</button>,
            ]
        }
    }

    //--------------------------------------------------
    return (
        <div className="blockRow">
            <div className="buttonColumn">
                {actionButtons}
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
