import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAlias } from '@/services/alias';
import { useAliasStore } from '@/stores/useAliasStore';
import { useEffect } from 'react';

export function useGetAlias(address?: string) {
	const { getAccessToken } = usePrivy();
	const { setAlias } = useAliasStore();
	const navigate = useNavigate();

	console.log('[useGetAlias] Hook called with address:', address);

	const query = useQuery({
		queryKey: ['user-alias', address],
		queryFn: async () => {
			console.log('[useGetAlias] Query function executing...');
			const token = await getAccessToken();
			console.log('[useGetAlias] Token obtained:', !!token);
			if (!token) throw new Error('Missing token');
			
			try {
				console.log('[useGetAlias] Calling getAlias service...');
				const response = await getAlias({ token });
				console.log('[useGetAlias] Response:', response);
				
				// Si no tiene alias o el alias está vacío, retornar null
				if (!response || !response.alias || response.alias.trim() === '') {
					console.log('[useGetAlias] No alias found, returning null');
					return null;
				}
				
				setAlias(response.alias);
				return response;
			} catch (error: any) {
				console.log('[useGetAlias] Error caught:', error);
				// Si no tiene alias (404 o error), retornar null sin error
				return null;
			}
		},
		enabled: !!address,
		retry: false,
		staleTime: 5 * 60 * 1000, // Cache por 5 minutos
		refetchOnMount: false,
	});

	console.log('[useGetAlias] Query state:', {
		isLoading: query.isLoading,
		isSuccess: query.isSuccess,
		isError: query.isError,
		data: query.data,
	});

	// Redirigir al onboarding si no tiene alias
	useEffect(() => {
		console.log('[useGetAlias] Checking redirect condition:', {
			isSuccess: query.isSuccess,
			data: query.data,
			shouldRedirect: query.isSuccess && query.data === null,
		});
		
		if (query.isSuccess && query.data === null) {
			console.log('[useGetAlias] Redirecting to onboarding...');
			navigate('/onboarding/welcome', { replace: true });
		}
	}, [query.isSuccess, query.data, navigate]);

	return query;
}
