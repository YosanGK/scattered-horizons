class UserStateManager {
    constructor() {
        this.checkLoginState();
        this.setupEventListeners();
    }

    checkLoginState() {
        const user = localStorage.getItem('user');
        if (user) {
            this.updateUIForLoggedIn(JSON.parse(user));
        }
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateLoginButton();
        });
    }

    updateUIForLoggedIn(user) {
        const joinBtn = document.getElementById('login-modal-joinBtn');
        if (joinBtn) {
            joinBtn.textContent = 'Logout';
            joinBtn.classList.add('logged-in');
            joinBtn.onclick = (e) => {
                e.preventDefault();
                this.handleLogout();
            };
        }

        const headerRight = document.querySelector('.button-group');
        if (headerRight && !document.querySelector('.user-welcome')) {
            const welcomeText = document.createElement('div');
            welcomeText.className = 'user-welcome';
            welcomeText.textContent = `Welcome, ${user.name}`;
            headerRight.insertBefore(welcomeText, joinBtn);
        }
    }

    updateLoginButton() {
        const joinBtn = document.getElementById('login-modal-joinBtn');
        if (joinBtn) {
            const user = localStorage.getItem('user');
            if (user) {
                this.updateUIForLoggedIn(JSON.parse(user));
            } else {
                joinBtn.textContent = 'Join Us';
                joinBtn.classList.remove('logged-in');
                joinBtn.onclick = null;
                const welcomeText = document.querySelector('.user-welcome');
                if (welcomeText) {
                    welcomeText.remove();
                }
            }
        }
    }

    async handleLogout() {
        try {
            const response = await fetch('http://127.0.0.1:5000/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                localStorage.removeItem('user');
                this.updateLoginButton();
                window.location.reload();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}

export const userStateManager = new UserStateManager();
