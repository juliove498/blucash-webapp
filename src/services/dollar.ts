export const getDollarOfficialPrice = async () => {
	try {
		const response = await fetch('https://api.bluelytics.com.ar/v2/latest');

		const data = await response.json();
		return data.oficial.value_sell;
	} catch (error) {
		throw new Error('Failed to fetch dollar price');
	}
};
