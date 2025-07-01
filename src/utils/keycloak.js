export function loginKeycloak() {
    window.location =
        `http://localhost:8080/realms/passport-realm/protocol/openid-connect/auth` +
        `?client_id=passport-app` +
        `&redirect_uri=${encodeURIComponent(window.location.origin)}` +
        `&response_type=code`;
}

export function getAccessToken() {
    return localStorage.getItem('kc_token');
}

export function logoutKeycloak() {
    localStorage.removeItem('kc_token');
    window.location = 'http://localhost:8080/realms/passport-realm/protocol/openid-connect/logout?redirect_uri=http://localhost:5173';
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
