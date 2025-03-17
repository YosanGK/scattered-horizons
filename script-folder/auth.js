import { googleConfig } from './google-auth-config.js';
import { apiService } from './api-service.js';

class AuthManager {
    constructor() {
        this.loginPopup = null;
        this.setupMessageListener();
    }

    setupMessageListener() {
        window.addEventListener('message', async (event) => {
            // Accept messages from the OAuth endpoints and our backend
            if (event.origin !== 'https://accounts.google.com' && 
                event.origin !== 'http://127.0.0.1:5000') return;

            try {
                const data = JSON.parse(event.data);
                if (data.type === 'oauth_response') {
                    await this.handleOAuthResponse(data);
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });
    }

    async googleLoginPopup() {
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const params = new URLSearchParams({
            client_id: googleConfig.clientId,
            redirect_uri: googleConfig.redirectUri,
            response_type: 'code',
            scope: googleConfig.scope,
            access_type: 'offline',
            prompt: 'consent',
            state: this.generateState()
        });

        const url = `${googleConfig.authEndpoint}?${params.toString()}`;

        this.loginPopup = window.open(
            url,
            'Google Login',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!this.loginPopup) {
            throw new Error('Popup blocked! Please enable popups for this site.');
        }
    }

    generateState() {
        const state = Math.random().toString(36).substring(2);
        sessionStorage.setItem('oauth_state', state);
        return state;
    }

    async handleOAuthResponse(data) {
        try {
            if (data.error) {
                throw new Error(data.error);
            }

            if (data.code) {
                const response = await apiService.handleGoogleCallback(data.code);
                this.handleAuthSuccess(response);
            }

            // Close popup if it exists
            if (this.loginPopup) {
                this.loginPopup.close();
                this.loginPopup = null;
            }

        } catch (error) {
            console.error('OAuth error:', error);
            this.handleAuthError(error);
        }
    }

    handleAuthSuccess(response) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Close the login modal
        const modalOverlay = document.getElementById('modal-overlay');
        const loginContainer = document.getElementById('login-container');
        if (modalOverlay && loginContainer) {
            loginContainer.classList.remove('active');
            setTimeout(() => {
                modalOverlay.classList.remove('active');
            }, 300);
        }

        // Update UI
        this.updateUIAfterLogin(response.user);
    }

    handleAuthError(error) {
        console.error('Authentication error:', error);
        // Implement error handling UI feedback here
    }

    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
    }

    updateUIAfterLogin(user) {
        // Update UI elements after successful login
        // This could include showing the user's name, avatar, etc.
        const userElements = document.querySelectorAll('.user-profile');
        userElements.forEach(element => {
            element.textContent = user.name;
        });
    }
}

export const authManager = new AuthManager();

