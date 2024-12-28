import { get } from '../helpers/axios-client.ts';
import { useCallback, useEffect, useState } from 'react';
import { Maybe } from '../types/utility.ts';
import { AxiosResponse } from 'axios';

export default function useFetch(url: string) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error>();
    const [data, setData] = useState<Maybe<AxiosResponse>>(null);

    const fetch = useCallback(
        async function fetch() {
            try {
                setIsLoading(true);
                const response = await get(url);
                setData(response);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        },
        [url]
    );
    useEffect(() => {
        fetch();
    }, [fetch]);
    return { isLoading, error, data };
}
