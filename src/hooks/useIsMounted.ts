import { useRef, useEffect } from 'react';

// from https://github.com/jmlweb/isMounted/blob/master/index.es.js
export const useIsMounted = () => {
    const isMounted = useRef(false);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; }
    }, []);
    return isMounted;
};
