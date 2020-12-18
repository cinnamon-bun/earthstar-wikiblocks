import * as React from 'react';

import './layouts.css';

interface LayoutProps {
    align?: 'left' | 'center' | 'right',
    className?: string,
    style?: any;
}

export const Box: React.FunctionComponent<LayoutProps> = (props) =>
    <div className={`box ${props.align || ''} ${props.className || ''}`} style={props.style}>
        {props.children}
    </div>

export const Stack: React.FunctionComponent<LayoutProps> = (props) =>
    <div className={`stack ${props.align || ''} ${props.className || ''}`} style={props.style}>
        {props.children}
    </div>

interface ClusterProps {
    align?: 'left' | 'center' | 'right' | 'justify',
    wrap?: boolean;
    style?: any;
}
export const Cluster: React.FunctionComponent<ClusterProps> = (props) => {
    // extra div is needed
    let align = props.align ? ('cluster-align-' + props.align) : '';
    let shouldWrap = (props.wrap === undefined) ? true : props.wrap;
    let wrap = shouldWrap ? 'cluster-wrap' : 'cluster-no-wrap';
    return <div className="cluster" style={props.style}>
        <div className={`clusterInner ${align} ${wrap}`}>{props.children}</div>
    </div>
}

export const ClusterSpacer: React.FunctionComponent = (props) =>
    <div className="clusterSpacer" style={{flexGrow: 1}} />

export const FlexRow: React.FunctionComponent<LayoutProps> = (props) => (
    <div className={`flexRow ${props.align || ''} ${props.className || ''}`} style={props.style}>
        {props.children}
    </div>
);

interface FlexItemProps {
    grow?: number;
    shrink?: number;
    basis?: string | number;
    style?: any;
}
export const FlexItem: React.FunctionComponent<FlexItemProps> = (props) => (
    <div
        className="flexItem"
        style={{
            flexGrow: props.grow,
            flexShrink: props.shrink,
            flexBasis: props.basis,
            ...props.style,
        }}
    >
        {props.children}
    </div>
);

export const FlexSpacer: React.FunctionComponent<FlexItemProps> = (props) =>
    <div className="flexItem" style={{flexGrow: 1}} />




export let LayoutDemo = () =>
    <Box>
        <Stack>
            <div style={{width: '30ch', backgroundColor: 'var(--base02)'}}>stackItem</div>
            <Box>
                <div style={{width: '20ch', backgroundColor: 'var(--base02)'}}>stackItem in a box</div>
            </Box>
            <div style={{width: '40ch', backgroundColor: 'var(--base02)'}}>stackItem</div>
            <Cluster align="right">
                <div style={{width: '30ch', backgroundColor: 'var(--base04)'}}>clusterItem</div>
                <div style={{width: '20ch', backgroundColor: 'var(--base04)'}}>clusterItem</div>
                <div style={{width: '40ch', backgroundColor: 'var(--base04)'}}>clusterItem</div>
                <div style={{width: '12ch', backgroundColor: 'var(--base04)'}}>clusterItem</div>
                <div style={{width: '20ch', backgroundColor: 'var(--base04)'}}>clusterItem</div>
            </Cluster>
            <div style={{width: '40ch', backgroundColor: 'var(--base02)'}}>stackItem</div>
            <Cluster wrap={false} align="justify">
                <div style={{width: '3ch', backgroundColor: 'var(--base04)'}}>a</div>
                <div style={{width: '2ch', backgroundColor: 'var(--base04)'}}>a</div>
                <div style={{width: '4ch', backgroundColor: 'var(--base04)'}}>a</div>
                <div style={{width: '1ch', backgroundColor: 'var(--base04)'}}>a</div>
                <div style={{width: '2ch', backgroundColor: 'var(--base04)'}}>a</div>
            </Cluster>
            <div style={{width: '40ch', backgroundColor: 'var(--base02)'}}>stackItem</div>
            <Cluster wrap={false} align="justify">
                <div style={{width: '3ch', backgroundColor: 'var(--base04)'}}>a</div>
                <div style={{width: '2ch', backgroundColor: 'var(--base04)'}}>a</div>
                <div style={{width: '4ch', backgroundColor: 'var(--base04)'}}>a</div>
                <ClusterSpacer />
                <div style={{width: '1ch', backgroundColor: 'var(--base04)'}}>a</div>
                <div style={{width: '2ch', backgroundColor: 'var(--base04)'}}>a</div>
            </Cluster>
            <div style={{width: '12ch', backgroundColor: 'var(--base02)'}}>stackItem</div>
            <div style={{width: '20ch', backgroundColor: 'var(--base02)'}}>stackItem</div>
        </Stack>
    </Box>
