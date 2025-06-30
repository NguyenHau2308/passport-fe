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
    const redirectUrl = window.location.origin;
    window.location =
        `http://localhost:8080/realms/passport-realm/protocol/openid-connect/logout` +
        `?redirect_uri=${encodeURIComponent(redirectUrl)}`;
}
