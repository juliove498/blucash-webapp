import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/config/queryClient';
import { updateAlias } from '@/services/alias';
import { useAliasStore } from '@/stores/useAliasStore';

export function useUpdateAlias() {
	const { getAccessToken } = usePrivy();
	const { setAlias } = useAliasStore();

	return useMutation({
		mutationFn: async ({ alias }: { alias: string }) => {
			const token = await getAccessToken();
			if (!token || !alias) throw new Error('Missing token/alias');

			return await updateAlias({ token, alias });
		},
		onSuccess: async (_data, _variables, _context) => {
			setAlias(_data.alias);
			queryClient.cancelQueries({ queryKey: ['user-alias'] });
		},
	});
}
