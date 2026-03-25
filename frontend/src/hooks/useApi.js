import { useCallback, useState } from 'react';
export function useApi() {
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null
    });
    const execute = useCallback(async (request) => {
        setState({ data: null, loading: true, error: null });
        try {
            const data = await request();
            setState({ data, loading: false, error: null });
            return data;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unexpected error';
            setState({ data: null, loading: false, error: message });
            throw error;
        }
    }, []);
    return { ...state, execute };
}
