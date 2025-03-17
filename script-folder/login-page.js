import { authManager } from './auth.js';
import { apiService } from './api-service.js';
import { userStateManager } from './userState.js';

document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modal-overlay');
    const loginContainer = document.getElementById('login-container');
    const joinBtn = document.getElementById('login-modal-joinBtn');
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');

    // Open modal
    joinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modalOverlay.classList.add('active');
        setTimeout(() => {
            loginContainer.classList.add('active');
        }, 10);
    });

    // Function to reset panel state
    function resetPanelState() {
        loginContainer.classList.remove('right-panel-active');
    }

    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            loginContainer.classList.remove('active');
            setTimeout(() => {
                modalOverlay.classList.remove('active');
                resetPanelState(); // Reset panel state after modal closes
            }, 300);
        }
    });

    // Handle sign up/sign in container animations
    signUpButton.addEventListener('click', () => {
        loginContainer.classList.add('right-panel-active');
    });

    signInButton.addEventListener('click', () => {
        loginContainer.classList.remove('right-panel-active');
    });

    // Close modal with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            loginContainer.classList.remove('active');
            setTimeout(() => {
                modalOverlay.classList.remove('active');
                resetPanelState(); // Reset panel state after modal closes
            }, 300);
        }
    });

    // Update Google button event listeners
    const googleButtons = document.querySelectorAll('.google-btn');
    googleButtons.forEach(button => {
        button.addEventListener('click', () => {
            try {
                authManager.googleLoginPopup();
            } catch (error) {
                console.error('Google login failed:', error);
                showLoginError('Failed to initialize Google login');
            }
        });
    });

    // Handle form submissions
    const signupForm = document.getElementById('signupForm');
    const signinForm = document.getElementById('signinForm');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('signup-name').value.trim(),
            email: document.getElementById('signup-email').value.trim(),
            password: document.getElementById('signup-password').value
        };

        if (!userData.name || !userData.email || !userData.password) {
            showLoginError('All fields are required');
            return;
        }

        try {
            const response = await apiService.register(userData);
            showLoginError('Registration successful!', 'success');
            // Close modal after success
            modalOverlay.classList.remove('active');
            loginContainer.classList.remove('active');
            signupForm.reset();
        } catch (error) {
            showLoginError(error.message);
        }
    });

    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = signinForm.querySelector('button[type="submit"]');
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Signing in...';

            const credentials = {
                email: document.getElementById('signin-email').value.trim(),
                password: document.getElementById('signin-password').value
            };

            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }

            const response = await apiService.login(credentials);
            
            if (response.status === 'success') {
                showLoginError('Login successful!', 'success');
                modalOverlay.classList.remove('active');
                loginContainer.classList.remove('active');
                signinForm.reset();
                window.location.reload();
            }
        } catch (error) {
            showLoginError(error.message || 'Login failed');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In';
        }
    });

    function showLoginError(message, type = 'error') {
        const existingError = document.querySelector('.login-error');
        if (existingError) existingError.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = `login-error ${type}`;
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: ${type === 'success' ? '#28a745' : '#dc3545'};
            background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
        `;

        const activeForm = document.querySelector('.form-container form');
        const submitButton = activeForm.querySelector('button[type="submit"]');
        activeForm.insertBefore(errorDiv, submitButton);

        // Auto-dismiss success messages
        if (type === 'success') {
            setTimeout(() => {
                errorDiv.remove();
            }, 3000);
        }
    }

    function handleAuthSuccess(response) {
        userStateManager.updateUIForLoggedIn(response.user);
    }
});
