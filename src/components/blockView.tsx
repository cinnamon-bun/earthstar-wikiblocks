import React, { useContext, useState, memo } from 'react';
import ReactMarkdown from 'react-markdown'

// lib
import { timestampToHuman } from '../lib/util';
import { Block } from '../lib/wikiLayer';

// hooks
import { KeypairContext } from '../hooks/keypairContext';
import { WikiLayerContext } from '../hooks/wikiLayerContext';

// components

// css
import '../css/index.css';
import '../css/pageAndBlocks.css';
import { log } from '../lib/util';

//================================================================================

export interface BlockViewProps {
    block: Block;
}
export let BlockView = memo(function BlockView(props: BlockViewProps) {
    log('BlockView', '---render---', props.block.id);

    let block = props.block;
    let wiki = useContext(WikiLayerContext);
    let keypair = useContext(KeypairContext);

    // If the block starts off with text = ' ', it was just created by AddBlock
    //  and we should begin in editing mode.
    let initialEditingText= (block.text === ' ') ? '' : null;
    let [editingText, setEditingText] = useState<string | null>(initialEditingText);  // null means not editing

    //--------------------------------------------------
    let beginEditing = () => {
        setEditingText(block.text);
    };
    let handleEditingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingText(e.target.value);
    }
    let saveEditing = () => {
        if (editingText !== null && keypair !== null && wiki !== null) {
            wiki.saveBlockText(keypair, {...block, text: editingText.trim()});
        }
        setEditingText(null);  // return to viewing mode
    };
    let cancelEditing = () => {
        // if this block was just created (and so has ' ' as its text), and
        // we cancel editing it, let's just delete it again
        if (block.text === ' ' && keypair !== null && wiki !== null) {
            wiki.saveBlockText(keypair, {...block, text: ''});
        }
        setEditingText(null);  // return to viewing mode
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
                <div className="details">
                    {block.owner !== 'common' ? null : (
                        <div>by: {block.author.slice(0, 12) + '...'}</div>
                    )}
                    <div>sort: {block.sort ? block.sort : ('' + block.creationTimestamp)}</div>
                    <div>created: {timestampToHuman(block.creationTimestamp)}</div>
                    <div>edited: {timestampToHuman(block.editTimestamp)}</div>
                </div>
            </div>
        </div>
    );
});
