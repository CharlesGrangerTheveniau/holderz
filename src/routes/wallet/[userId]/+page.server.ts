export async function load({ url }: any) {
    console.log(url);
    return { origin: url.origin };
}