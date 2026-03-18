// Centralized API client attached with auth headers
class ApiClient {
    async fetch(url, options = {}) {
        const token = sessionManager.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const response = await fetch(url, { ...options, headers });
        return response.json();
    }
}

const apiClient = new ApiClient();
