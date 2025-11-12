import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/config/queryClient';
import { createAlias } from '@/services/alias';
import { useAliasStore } from '@/stores/useAliasStore';

export function useCreateAlias() {
	const { user, getAccessToken } = usePrivy();
	const { setAlias } = useAliasStore();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async ({ alias }: { alias: string }) => {
			const token = await getAccessToken();
			if (!token || !alias) throw new Error('Missing token/alias');

			return await createAlias({ token, alias });
		},
		onSuccess: async (_data, _variables, _context) => {
			setAlias(_data.alias);
			const smartWallet = user?.smartWallet;
			if (!smartWallet) {
				return navigate('/session-error', { replace: true });
			}

			navigate('/app', { replace: true });
			queryClient.cancelQueries({ queryKey: ['user-alias'] });
		},
	});
}
