import type { Address } from 'viem';

const BASE_URL = import.meta.env.VITE_API_URL;

export async function createAlias({
	token,
	alias,
}: {
	token: string | null;
	alias: string;
}): Promise<{ alias: string }> {
	try {
		const res = await fetch(`${BASE_URL}/alias`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ alias }),
		});

		if (!res.ok) {
			throw await res.json();
		}

		const data: { alias: string } = await res.json();
		return data;
	} catch (err: any) {
		throw err;
	}
}

export async function getAddressByAlias({
	token,
	alias,
}: {
	token: string | null;
	alias: string | Address;
}): Promise<{
	alias?: string;
	phoneNumber?: string;
	email?: string;
	smartWallet: { address: Address };
}> {
	try {
		console.log('Fetching address for alias:', alias);
		const res = await fetch(`${BASE_URL}/alias/${alias}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message);
		}

		const data = await res.json();
		return data;
	} catch (err: any) {
		throw err;
	}
}

export async function getAlias({ token }: { token: string | null }): Promise<{ alias: string }> {
	try {
		console.log('[getAlias Service] Calling API with token:', !!token);
		console.log('[getAlias Service] URL:', `${BASE_URL}/alias`);
		
		const res = await fetch(`${BASE_URL}/alias`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});

		console.log('[getAlias Service] Response status:', res.status);
		console.log('[getAlias Service] Response ok:', res.ok);

		if (!res.ok) {
			const errorText = await res.text();
			console.log('[getAlias Service] Error response:', errorText);
			throw new Error(errorText);
		}

		const data: { alias: string } = await res.json();
		console.log('[getAlias Service] Success, alias:', data.alias);
		return data;
	} catch (err: any) {
		console.log('[getAlias Service] Exception caught:', err);
		throw err;
	}
}

export async function updateAlias({
	token,
	alias,
}: {
	token: string | null;
	alias: string;
}): Promise<{ alias: string }> {
	try {
		const res = await fetch(`${BASE_URL}/alias/${alias}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});

		if (!res.ok) {
			const error = await res.json();

			throw new Error(error.message);
		}

		const data: { alias: string } = await res.json();
		return data;
	} catch (err: any) {
		throw err;
	}
}
