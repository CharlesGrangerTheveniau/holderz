export async function getPrice (params: any) {
    const urlParams = new URLSearchParams({
        ids: params.ids.join(','),
        currencies: params.currencies.join(','),
        precision: params.precision?.toString() || '2'
    });

    const res = await fetch(params.origin + `/api/getPrices?${urlParams}`);
    const item = await res.json();
    const prices = item.data;
    console.log('Prices data received on the page', prices);
    return prices;
}

export async function getExchanges(origin: any) {
    const res = await fetch(origin + `/api/getExchanges`);
	const item = await res.json();
    const exchanges = item.data
    console.log('Exchanges data received on the page', exchanges)
    return exchanges
}