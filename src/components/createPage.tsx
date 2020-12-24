import React, { useState, useContext } from 'react';
import { navigate } from 'raviger';

// lib
import { log } from '../lib/util';

// hooks
import { KeypairContext } from '../hooks/keypairContext';

// components
import {
    Stack,
    Cluster,
} from './layouts';

// css
import '../css/index.css';
import '../css/createPage.css';

export let CreatePage = () => {
    log('CreatePage', '---render---');

    let keypair = useContext(KeypairContext);

    let [title, setTitle] = useState<string>('');
    let [isCommon, setIsCommon] = useState(true);
    log('CreatePage', 'isCommon = ', isCommon);

    return <form className="createPage"
        onSubmit={e => {
            e.preventDefault();
            if (keypair === null) { return; }
            let owner = isCommon ? 'common' : keypair.address;
            let newUrl = `/page/${owner}/${encodeURIComponent(title.trim())}`
            log('CreatePage', newUrl);
            navigate(newUrl);
        }}
    >
        <Stack>
            <h1>Create a page</h1>
            <div className='textFaint'>Pages can't be renamed later, so choose wisely.</div>
            <Cluster>
                <input type="text" value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="New Page Title"
                />
            </Cluster>
            <div>
                <label>
                    <input type="radio" name="owner" id="common" value="common"
                        checked={isCommon} onChange={e => setIsCommon(e.target.checked)}
                    />
                    Common (anyone can edit)
                </label>
            </div>
            {keypair === null ? null :
                <div>
                    <label>
                        <input type="radio" name="owner" id="me" value="me"
                            checked={!isCommon} onChange={e => setIsCommon(!(e.target.checked))}
                        />
                        Owned by <code>{keypair.address.split('.')[0]}</code> (only I can edit)
                    </label>
                </div>
            }
            <button type="submit" className='buttonSolidStrong'>Create</button>
        </Stack>
    </form>;
};