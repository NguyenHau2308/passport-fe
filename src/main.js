import { createApp } from 'vue'
import App from './App.vue'
import { getAccessToken, loginKeycloak } from './utils/keycloak.js'

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
            redirect_uri: 'http://localhost:5173',
        })
    })
    .then(r => r.json())
    .then(data => {
        localStorage.setItem('kc_token', data.access_token);
        window.location = 'http://localhost:5173';
    });
} else {
    createApp(App).mount('#app')
}
