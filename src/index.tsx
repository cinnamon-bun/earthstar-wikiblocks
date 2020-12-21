import React from 'react';
import ReactDOM from 'react-dom';

// lib
import { log } from './lib/util';

// hooks

// components
import { App } from './components/app';

// css
import './css/index.css';

setTimeout(() => {
    log('INDEX', '---first render---');
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById('root')
    );
}, 600);
