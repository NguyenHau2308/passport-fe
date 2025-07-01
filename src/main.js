import { createApp } from 'vue'
import App from './App.vue'
import { getAccessToken, loginKeycloak } from './utils/keycloak.js'

const redirectUri = window.location.origin

if (!getAccessToken() && !window.location.search.includes('code=')) {
    loginKeycloak();
}

if (window.location.search.includes('code=')) {
    const code = new URLSearchParams(window.location.search).get('code');
    fetch('http://localhost:8080/realms/passport-realm/protocol/openid-connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: 'passport-app',
            client_secret: 'NgrqjI3dqFUn2lztBRJNi0i7MJaPxCT7',
            redirect_uri: redirectUri,
        })
    })
        .then(r => r.json())
        .then(data => {
            if (data.access_token) {
                localStorage.setItem('kc_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('kc_refresh_token', data.refresh_token);
                }
                window.location = redirectUri;
            } else {
                alert('Lỗi đăng nhập Keycloak:\n' + (data.error_description || JSON.stringify(data)));
            }
        });
} else {
    createApp(App).mount('#app')
}
