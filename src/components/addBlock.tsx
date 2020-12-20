import { memo } from 'react';

// lib
import { log } from '../lib/util';

// hooks

// components

// css
import '../css/index.css';
import '../css/pageAndBlocks.css';

//================================================================================

export interface AddBlockProps {
    sort: number;
    // TODO: this needs 2 inputs: a lower and upper bound, each of which can be null.
    // That way it can know when to use the current time if it's the last item on the page.
}
export let AddBlock = memo(function AddBlock(props: AddBlockProps) {
    log('AddBlock', '---render---', props.sort);
    return (
        <div className="addBlock"
            onClick={() => log('AddBlock', 'clicked.  sort =', props.sort)}
        >
            <div className="buttonColumn">
                <button type="button">add</button>
            </div>
            <hr />
        </div>
    );
});
