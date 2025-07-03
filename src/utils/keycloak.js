console.log('VITE_BE_URL:', import.meta.env.VITE_BE_URL);
// export function loginKeycloak() {
//     window.location = `${process.env.VUE_APP_BE_URL}/auth/login?redirect_uri=${encodeURIComponent(window.location.origin)}`;
// }

const BE_URL = import.meta.env.VITE_BE_URL;

export function loginKeycloak() {
    window.location = `${BE_URL}/auth/login?redirect_uri=${encodeURIComponent(window.location.origin)}`;
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
    fetch(`${BE_URL}/auth/logout`, {
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
        .then(() => {
            localStorage.removeItem('kc_token');
            localStorage.removeItem('kc_refresh_token');
            window.location = '/';
        })
        .catch(() => {
            window.location = '/';
        });
}


