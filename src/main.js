import { createApp } from 'vue'
import App from './App.vue'
import { getAccessToken, loginKeycloak } from './utils/keycloak.js'

const BE_URL = process.env.VUE_APP_BE_URL;
const redirectUri = window.location.origin;

if (!getAccessToken() && !window.location.search.includes('code=')) {
    loginKeycloak();
} else if (window.location.search.includes('code=')) {
    const code = new URLSearchParams(window.location.search).get('code');
    fetch(`${BE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            redirect_uri: redirectUri
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
