import { memo, useContext } from 'react';

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

    let addBlock = () => {
        log('AddBlock', 'clicked...  sort =', props.sort);
        if (wiki === null || keypair === null) { return; }
        let block = wiki.newBlockInPage(props.page, keypair.address, '...');
        block.sort = props.sort;
        log('AddBlock', '...saving 2 docs (text and sort)...');
        wiki.saveBlockText(keypair, block);
        wiki.saveBlockSort(keypair, block);
        log('AddBlock', '...done.');
    }

    return (
        <div className="addBlock"
            onClick={addBlock}
        >
            <div className="buttonColumn">
                <button type="button">add</button>
            </div>
            <hr />
        </div>
    );
});
