export const googleConfig = {
    clientId: '38176584813-0taotrlmlv20pn18t3utje7g2e1j0d3f.apps.googleusercontent.com',
    redirectUri: 'http://127.0.0.1:5000/auth/google/callback',  // Updated to local development
    scope: 'email profile openid',
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token'
};
