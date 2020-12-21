import { memo, useContext, useState } from 'react';

// lib
import { log } from '../lib/util';
import { Page } from '../lib/wikiLayer';

// hooks
import { WikiLayerContext } from '../hooks/wikiLayerContext';
import { KeypairContext } from '../hooks/keypairContext';

// components

// css
import '../css/index.css';
import '../css/pageAndBlocks.css';

//================================================================================

export interface AddBlockProps {
    sort: number;
    page: Page;
    // TODO: this needs 2 inputs: a lower and upper bound, each of which can be null.
    // That way it can know when to use the current time if it's the last item on the page.
}
export let AddBlock = memo(function AddBlock(props: AddBlockProps) {
    log('AddBlock', '---render---', props.sort);

    let wiki = useContext(WikiLayerContext);
    let keypair = useContext(KeypairContext);
    let [isPending, setIsPending] = useState(false);

    let addBlock = async () => {
        log('AddBlock', 'clicked...  sort =', props.sort);
        if (isPending) { return; }
        if (wiki === null || keypair === null) { return; }
        // HACK: create new block with some initial text so it won't count as deleted,
        //  and choose something unusual so the BlockView will launch right into edit mode.
        // We have no way of communicating directly with the BlockView to ask it to start
        //  in edit mode -- changes have to pass through Earthstar documents.
        // So let's start it off with text = ' '
        let block = wiki.newBlockInPage(props.page, keypair.address, ' ');
        block.sort = props.sort;
        log('AddBlock', '...saving 2 docs (text and sort)...');
        setIsPending(true);
        let successes = await Promise.allSettled([
            wiki.saveBlockSort(keypair, block),
            wiki.saveBlockText(keypair, block),
        ]);
        setIsPending(false);
        log('AddBlock', '...done.  successes =', successes);
    }

    return (
        <div className={"addBlock " + (isPending ? 'pending' : '')}
            onClick={addBlock}
        >
            <div className="buttonColumn">
                <button type="button" disabled={isPending}>{isPending ? 'adding...' : 'add'}</button>
            </div>
            <hr />
        </div>
    );
});
