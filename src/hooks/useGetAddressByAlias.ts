import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { getAddressByAlias } from '@/services/alias';

export function useGetAddressByAlias(alias?: string) {
	const { getAccessToken } = usePrivy();
	const [debouncedAlias] = useDebounce(alias, 500);

	return useQuery({
		queryKey: ['alias-address', debouncedAlias],
		retry: false,
		queryFn: async () => {
			const token = await getAccessToken();
			if (!token || !alias) throw new Error('Missing token/alias');
			return await getAddressByAlias({ token, alias: debouncedAlias ?? '' });
		},
		enabled: !!debouncedAlias && debouncedAlias.length > 7,
	});
}
