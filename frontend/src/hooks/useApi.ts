import { useCallback, useState } from 'react';

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (request: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });

    try {
      const data = await request();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      setState({ data: null, loading: false, error: message });
      throw error;
    }
  }, []);

  return { ...state, execute };
}
