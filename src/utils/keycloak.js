console.log('VUE_APP_BE_URL:', process.env.VUE_APP_BE_URL);
export function loginKeycloak() {
    window.location = `${process.env.VUE_APP_BE_URL}/auth/login?redirect_uri=${encodeURIComponent(window.location.origin)}`;
}

export function getAccessToken() {
    return localStorage.getItem('kc_token');
}

export function getUserRoles() {
    const token = getAccessToken();
    if (!token) return [];
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload?.realm_access?.roles || [];
    } catch {
        return [];
    }
}
export function logoutKeycloak() {
    // console.log('Logging out Keycloak...');
    // console.log('kc_token:', localStorage.getItem('kc_token'));
    // console.log('kc_refresh_token:', localStorage.getItem('kc_refresh_token'));
    fetch(`${process.env.VUE_APP_BE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Authorization': 'Bearer ' + getAccessToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            refresh_token: localStorage.getItem('kc_refresh_token')
        })
    })
        .then(res => {
            console.log('BE logout status:', res.status);
            localStorage.removeItem('kc_token');
            localStorage.removeItem('kc_refresh_token');
            console.log('Token đã remove:',
                'kc_token:', localStorage.getItem('kc_token'),
                'kc_refresh_token:', localStorage.getItem('kc_refresh_token')
            );
            // setTimeout(() => {
            //     window.location = '/';
            // }, 10000);
        })
        .catch(e => {
            console.error('Logout error:', e);
        });
}

