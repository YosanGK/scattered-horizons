const API_BASE_URL = 'http://127.0.0.1:5000';  
class ApiService {
    constructor() {
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    async register(userData) {
        try {
            console.log('Registering user:', userData);
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(userData),
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            console.log('Registration response:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            console.log('Attempting login:', credentials.email);
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(credentials),
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.status === 'success') {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async googleLogin(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/google-login`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify({ token }),
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Google login failed');
            }
            return data;
        } catch (error) {
            throw error;
        }
    }

    async handleGoogleCallback(code) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google/callback`, { // Fixed endpoint
                method: 'GET',
                headers: this.defaultHeaders,
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Google authentication failed');
            }

            // Store user data in localStorage after successful Google login
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Google callback error:', error);
            throw error;
        }
    }
}

export const apiService = new ApiService();
