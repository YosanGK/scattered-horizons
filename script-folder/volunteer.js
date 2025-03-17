

class NonprofitAPI {
    constructor() {
        this.apiKey = 'pk_live_6c3e48948f5d5c138b7c915d2ab067a0'; 
        this.baseUrl = 'https://partners.every.org/v0.2';
        this.currentPage = 1;
        this.totalPages = 1;
        this.isLoading = false;
    }

    async searchNonprofits(query = '', cause = '') {
        if (this.isLoading) return { nonprofits: [], pagination: null };
        
        this.isLoading = true;
        try {
            let url;
            if (cause) {
                // Use browse endpoint for causes
                url = `${this.baseUrl}/browse/${cause}`;
            } else if (query) {
                // Use search endpoint for search terms
                url = `${this.baseUrl}/search/${query}`;
            } else {
                // Default to education cause if no query or cause specified
                url = `${this.baseUrl}/browse/education`;
            }

            // Add API key and pagination
            const params = new URLSearchParams({
                apiKey: this.apiKey,
                causes: cause || 'education,humanitarian-aid',
                page: this.currentPage,
                take: 4,  // Changed to 4 items per page
                search: query
            });

            const response = await fetch(`${url}?${params.toString()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            // Update pagination info
            if (data.pagination) {
                this.totalPages = data.pagination.pages;
            }

            return {
                nonprofits: data.nonprofits?.map(org => this.formatNonprofit(org)) || [],
                pagination: data.pagination
            };
        } catch (error) {
            console.error('Error fetching nonprofits:', error);
            return { nonprofits: [], pagination: null };
        } finally {
            this.isLoading = false;
        }
    }

    async getNonprofitDetails(identifier) {
        try {
            const response = await fetch(`${this.baseUrl}/nonprofit/${identifier}?apiKey=${this.apiKey}`);
            if (!response.ok) throw new Error('Failed to fetch nonprofit details');
            
            const data = await response.json();
            return this.formatNonprofit(data.data.nonprofit);
        } catch (error) {
            console.error('Error fetching nonprofit details:', error);
            return null;
        }
    }

    formatNonprofit(org) {
        return {
            id: org.id,
            name: org.name,
            description: org.descriptionLong || org.description || 'No description available.',
            location: org.locationAddress || 'Location not specified',
            logoUrl: org.logoUrl,
            coverImageUrl: org.coverImageUrl,
            profileUrl: org.profileUrl,
            websiteUrl: org.websiteUrl,
            tags: org.nonprofitTags || [],
            ein: org.ein
        };
    }

    hasMorePages() {
        return this.currentPage < this.totalPages;
    }
}

class OrganizationsUI {
    constructor() {
        this.api = new NonprofitAPI();
        this.grid = document.getElementById('organizationsGrid');
        this.searchInput = document.getElementById('searchInput');
        this.causeFilter = document.getElementById('causeFilter');
        this.loadMoreBtn = document.getElementById('loadMore');
        this.setupEventListeners();
        this.loadOrganizations();
    }

    setupEventListeners() {
        let debounceTimer;
        this.searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this.loadOrganizations(), 500);
        });

        this.causeFilter.addEventListener('change', () => this.loadOrganizations());
        this.loadMoreBtn.addEventListener('click', () => this.loadMore());
    }

    async loadOrganizations() {
        this.showLoading();
        const searchTerm = this.searchInput?.value.trim() || '';
        const cause = this.causeFilter?.value || '';
        
        try {
            const { nonprofits, pagination } = await this.api.searchNonprofits(searchTerm, cause);
            this.displayOrganizations(nonprofits);
            this.updatePagination(pagination);
        } catch (error) {
            this.showError('Failed to load organizations. Please try again.');
        }
    }

    updatePagination(pagination) {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display = this.api.hasMorePages() ? 'block' : 'none';
        }
    }

    displayOrganizations(organizations) {
        if (!organizations.length) {
            this.grid.innerHTML = '<div class="no-results">No organizations found.</div>';
            return;
        }

        this.organizations = organizations;

        this.grid.innerHTML = organizations.map(org => `
            <div class="organization-card">
                <div class="org-image-container">
                    <img src="${org.logoUrl || 'https://placehold.co/300x200?text=No+Image'}" 
                         alt="${org.name}" 
                         class="org-image"
                         onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                </div>
                <div class="org-content">
                    <h3>${this.truncateText(org.name, 50)}</h3>
                    <div class="org-tags">
                        ${org.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <p class="org-description">${this.truncateText(org.description, 150)}</p>
                    <div class="location">
                        <i class="fas fa-map-marker-alt"></i> ${this.truncateText(org.location || 'Location not specified', 30)}
                    </div>
                    <div class="org-actions">
                        <a href="${org.profileUrl || '#'}" target="_blank" class="donate-btn">Learn More</a>
                    </div>
                </div>
            </div>
        `).join('');

        // Create modal if it doesn't exist
        this.createModal();

        this.loadMoreBtn.style.display = organizations.length >= 4 ? 'block' : 'none';
    }

    createModal() {
        if (!document.getElementById('orgModal')) {
            const modal = document.createElement('div');
            modal.id = 'orgModal';
            modal.className = 'org-modal';
            modal.innerHTML = `
                <div class="org-modal-content">
                    <button class="org-modal-close">&times;</button>
                    <div class="org-modal-header">
                        <img src="" alt="Organization">
                    </div>
                    <div class="org-modal-body">
                        <h2></h2>
                        <p></p>
                        <div class="location"></div>
                    </div>
                    <div class="org-modal-footer">
                        <a href="#" class="donate-btn" target="_blank">Donate</a>
                        <a href="#" class="volunteer-btn" target="_blank">Visit Website</a>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add modal close functionality
            const closeBtn = modal.querySelector('.org-modal-close');
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });

            // Add keyboard support for closing modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            });
        }
    }

    async showOrgDetails(orgId) {
        const org = this.organizations.find(o => o.id === orgId);
        if (!org) return;

        const modal = document.getElementById('orgModal');
        if (!modal) {
            this.createModal();
        }

        const headerImg = modal.querySelector('.org-modal-header img');
        const title = modal.querySelector('.org-modal-body h2');
        const description = modal.querySelector('.org-modal-body p');
        const location = modal.querySelector('.org-modal-body .location');
        const donateBtn = modal.querySelector('.org-modal-footer .donate-btn');
        const websiteBtn = modal.querySelector('.org-modal-footer .volunteer-btn');

        headerImg.src = org.logoUrl || 'https://placehold.co/800x400?text=No+Image';
        headerImg.alt = org.name;
        title.textContent = org.name;
        description.textContent = org.description;
        location.textContent = org.location || 'Location not specified';
        donateBtn.href = org.profileUrl || '#';
        websiteBtn.href = org.websiteUrl || '#';

        document.getElementById('orgModal').classList.add('active');
    }

    truncateText(text, maxLength) {
        if (!text) return 'No description available.';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    async loadMore() {
        if (this.api.isLoading || !this.api.hasMorePages()) return;
        
        this.api.currentPage++;
        await this.loadOrganizations();
    }

    showLoading() {
        if (this.grid) {
            this.grid.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading organizations...</p>
                </div>
            `;
        }
    }

    showError(message) {
        if (this.grid) {
            this.grid.innerHTML = `
                <div class="error">
                    <p>${message}</p>
                    <button onclick="location.reload()">Try Again</button>
                </div>
            `;
        }
    }
}

// Remove the companies array and renderCompanies functions
export { NonprofitAPI, OrganizationsUI };

// Initialize when DOM is loaded
let organizationsUI;
document.addEventListener('DOMContentLoaded', () => {
    organizationsUI = new OrganizationsUI();
});

// Add global function for modal access
window.showOrgDetails = function(orgId) {
    if (organizationsUI) {
        organizationsUI.showOrgDetails(orgId);
    }
};

