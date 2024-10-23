// place files you want to import through the `$lib` alias in this folder.
export function getAvatar(session: any) {
    let avatar_src;
    let identities = session?.user.identities
    if(identities) {
        identities.forEach((i: { provider: string; identity_data: { avatar_url: any; }; }) => {
            if (i.provider == 'google') {
                avatar_src = i.identity_data?.avatar_url
            }
        })
    }
    return avatar_src
}