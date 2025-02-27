// DOM Elements
const usernameInput = document.getElementById('username');
const searchBtn = document.getElementById('search-btn');
const profileContainer = document.getElementById('profile-container');
const reposContainer = document.getElementById('repos-container');
const errorContainer = document.getElementById('error-container');
const loadingSpinner = document.querySelector('.loading-spinner');
const themeToggle = document.querySelector('.theme-toggle');
const moonIcon = document.querySelector('.fa-moon');
const sunIcon = document.querySelector('.fa-sun');
const fetchReposBtn = document.getElementById('fetch-repos');
const languageFilter = document.getElementById('language-filter');
const sortOption = document.getElementById('sort-option');
const reposList = document.getElementById('repos-list');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const recentSearchesContainer = document.querySelector('.recent-searches');
const recentSearchesList = document.getElementById('recent-searches-list');
const rateLimitElement = document.getElementById('rate-limit');
const popularUsers = document.querySelectorAll('.popular-user');

// Global Variables
let currentUsername = '';
let allRepos = [];
let currentPage = 1;
let reposPerPage = 8;
let languages = new Set();
let recentSearches = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load theme preference
    loadThemePreference();
    
    // Load recent searches from localStorage
    loadRecentSearches();
    
    // Event Listeners
    themeToggle.addEventListener('click', toggleTheme);
    usernameInput.addEventListener('keydown', handleEnterKey);
    fetchReposBtn.addEventListener('click', fetchRepositories);
    languageFilter.addEventListener('change', filterRepositories);
    sortOption.addEventListener('change', sortRepositories);
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    
    // Add event listeners for popular users
    popularUsers.forEach(user => {
        user.addEventListener('click', (e) => {
            e.preventDefault();
            const username = e.target.dataset.username;
            usernameInput.value = username;
            fetchProfile();
        });
    });
    
    // Check if username in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');
    
    if (usernameParam) {
        usernameInput.value = usernameParam;
        fetchProfile();
    }
    
    // Check API rate limit
    checkRateLimit();
});

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    moonIcon.classList.toggle('active');
    sunIcon.classList.toggle('active');
    
    // Save preference to localStorage
    const isDarkTheme = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDarkTheme);
    
    // Add animation
    document.body.style.transition = 'background-color 0.3s, color 0.3s';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

// Load theme preference from localStorage
function loadThemePreference() {
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        moonIcon.classList.add('active');
        sunIcon.classList.remove('active');
    } else {
        sunIcon.classList.add('active');
        moonIcon.classList.remove('active');
    }
}

// Handle Enter key press
function handleEnterKey(e) {
    if (e.key === 'Enter') {
        fetchProfile();
    }
}

// Fetch GitHub Profile
function fetchProfile() {
    const username = usernameInput.value.trim();
    
    if (!username) {
        showError('Please enter a GitHub username');
        return;
    }
    
    // Show loading spinner
    showLoading();
    
    // Hide previous results
    hideElement(profileContainer);
    hideElement(reposContainer);
    hideElement(errorContainer);
    
    // Update URL with username parameter
    updateURLParameter('username', username);
    
    // Fetch user data
    fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status === 404 ? 'User not found' : 'Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Save username for later use
            currentUsername = username;
            
            // Display profile data
            displayProfile(data);
            
            // Add to recent searches
            addToRecentSearches(data);
            
            // Hide loading spinner
            hideLoading();
            
            // Show profile
            showElement(profileContainer);
            
            // Check API rate limit
            checkRateLimit();
        })
        .catch(error => {
            hideLoading();
            showError(`Error: ${error.message}`);
        });
}

// Display Profile Information
function displayProfile(data) {
    // Set profile data
    document.getElementById('avatar').src = data.avatar_url;
    document.getElementById('name').textContent = data.name || data.login;
    document.getElementById('login').textContent = `@${data.login}`;
    document.getElementById('bio').textContent = data.bio || 'No bio available';
    document.getElementById('location').textContent = data.location || 'Not specified';
    document.getElementById('joined').textContent = formatDate(data.created_at);
    document.getElementById('followers').textContent = formatNumber(data.followers);
    document.getElementById('following').textContent = formatNumber(data.following);
    document.getElementById('repos').textContent = formatNumber(data.public_repos);
    document.getElementById('gists').textContent = formatNumber(data.public_gists);
    document.getElementById('profile-link').href = data.html_url;
    
    // Add animations
    const elements = document.querySelectorAll('.profile-card *');
    elements.forEach((element, index) => {
        element.style.animation = `fadeIn 0.3s ease-out ${index * 0.05}s both`;
    });
}

// Fetch Repositories
function fetchRepositories() {
    if (!currentUsername) return;
    
    // Show loading spinner
    showLoading();
    
    // Hide previous repos
    hideElement(reposContainer);
    
    fetch(`https://api.github.com/users/${currentUsername}/repos?per_page=100`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch repositories');
            }
            return response.json();
        })
        .then(data => {
            // Store all repos
            allRepos = data;
            
            // Extract languages
            extractLanguages(data);
            
            // Populate language filter
            populateLanguageFilter();
            
            // Reset pagination
            currentPage = 1;
            
            // Sort and display repos
            sortRepositories();
            
            // Hide loading spinner
            hideLoading();
            
            // Show repos container
            showElement(reposContainer);
            
            // Scroll to repos
            reposContainer.scrollIntoView({ behavior: 'smooth' });
            
            // Check API rate limit
            checkRateLimit();
        })
        .catch(error => {
            hideLoading();
            showError(`Error: ${error.message}`);
        });
}

// Extract unique languages from repositories
function extractLanguages(repos) {
    languages.clear();
    languages.add('all');
    
    repos.forEach(repo => {
        if (repo.language) {
            languages.add(repo.language);
        }
    });
}

// Populate language filter dropdown
function populateLanguageFilter() {
    // Clear existing options
    languageFilter.innerHTML = '';
    
    // Add options
    languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language.toLowerCase();
        option.textContent = language === 'all' ? 'All Languages' : language;
        languageFilter.appendChild(option);
    });
}

// Filter repositories based on selected language
function filterRepositories() {
    const selectedLanguage = languageFilter.value;
    
    // Reset pagination
    currentPage = 1;
    
    // Filter repos if necessary
    let filteredRepos = allRepos;
    if (selectedLanguage !== 'all') {
        filteredRepos = allRepos.filter(repo => {
            return repo.language && repo.language.toLowerCase() === selectedLanguage;
        });
    }
    
    // Sort and display repos
    sortAndDisplayRepositories(filteredRepos);
}

// Sort repositories based on selected option
function sortRepositories() {
    const selectedSort = sortOption.value;
    
    // Reset pagination
    currentPage = 1;
    
    // Get filtered repos
    const selectedLanguage = languageFilter.value;
    let filteredRepos = allRepos;
    if (selectedLanguage !== 'all') {
        filteredRepos = allRepos.filter(repo => {
            return repo.language && repo.language.toLowerCase() === selectedLanguage;
        });
    }
    
    // Sort repos
    switch (selectedSort) {
        case 'stars':
            filteredRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            break;
        case 'forks':
            filteredRepos.sort((a, b) => b.forks_count - a.forks_count);
            break;
        case 'updated':
            filteredRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            break;
    }
    
    // Display repos
    displayRepositories(filteredRepos);
}

// Sort and display repositories
function sortAndDisplayRepositories(repos) {
    const selectedSort = sortOption.value;
    
    // Sort repos
    switch (selectedSort) {
        case 'stars':
            repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            break;
        case 'forks':
            repos.sort((a, b) => b.forks_count - a.forks_count);
            break;
        case 'updated':
            repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            break;
    }
    
    // Display repos
    displayRepositories(repos);
}

// Display repositories with pagination
function displayRepositories(repos) {
    // Clear existing repos
    reposList.innerHTML = '';
    
    // Set up pagination
    const totalPages = Math.ceil(repos.length / reposPerPage);
    const startIndex = (currentPage - 1) * reposPerPage;
    const endIndex = Math.min(startIndex + reposPerPage, repos.length);
    
    // Update pagination controls
    updatePaginationControls(totalPages);
    
    // Display repos for current page
    if (repos.length === 0) {
        reposList.innerHTML = '<p class="no-repos">No repositories found</p>';
        hideElement(document.getElementById('repos-pagination'));
        return;
    }
    
    // Show pagination if necessary
    if (totalPages > 1) {
        showElement(document.getElementById('repos-pagination'));
    } else {
        hideElement(document.getElementById('repos-pagination'));
    }
    
    // Create repo cards
    for (let i = startIndex; i < endIndex; i++) {
        const repo = repos[i];
        const repoCard = createRepoCard(repo);
        reposList.appendChild(repoCard);
    }
}

// Create a repository card
function createRepoCard(repo) {
    const repoCard = document.createElement('div');
    repoCard.className = 'repo-card';
    
    // Get language color
    const languageColor = getLanguageColor(repo.language);
    
    // Format date
    const updatedAt = formatDate(repo.updated_at);
    
    repoCard.innerHTML = `
        <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
        <p class="repo-description">${repo.description || 'No description provided'}</p>
        <div class="repo-meta">
            ${repo.language ? `
                <div class="repo-language">
                    <span class="language-dot" style="background-color: ${languageColor}"></span>
                    ${repo.language}
                </div>
            ` : ''}
            <div class="repo-stars">
                <i class="fas fa-star"></i>
                ${formatNumber(repo.stargazers_count)}
            </div>
            <div class="repo-forks">
                <i class="fas fa-code-branch"></i>
                ${formatNumber(repo.forks_count)}
            </div>
            <div class="repo-updated">
                <i class="fas fa-history"></i>
                ${updatedAt}
            </div>
        </div>
    `;
    
    // Add animation
    repoCard.style.animationDelay = `${(reposList.children.length * 0.1)}s`;
    
    return repoCard;
}

// Update pagination controls
function updatePaginationControls(totalPages) {
    // Update page info
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Update buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// Change page
function changePage(direction) {
    currentPage += direction;
    
    // Filter and sort repos again
    filterRepositories();
    
    // Scroll to top of repos
    reposContainer.scrollIntoView({ behavior: 'smooth' });
}

// Add to recent searches
function addToRecentSearches(userData) {
    // Check if user already exists in recent searches
    const existingIndex = recentSearches.findIndex(user => user.login === userData.login);
    
    // If user exists, remove them from the array
    if (existingIndex !== -1) {
        recentSearches.splice(existingIndex, 1);
    }
    
    // Add user to the beginning of the array
    recentSearches.unshift({
        login: userData.login,
        avatar_url: userData.avatar_url,
        name: userData.name || userData.login
    });
    
    // Keep only the last 5 searches
    if (recentSearches.length > 5) {
        recentSearches.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('githubRecentSearches', JSON.stringify(recentSearches));
    
    // Update UI
    displayRecentSearches();
}

// Load recent searches from localStorage
function loadRecentSearches() {
    const storedSearches = localStorage.getItem('githubRecentSearches');
    
    if (storedSearches) {
        recentSearches = JSON.parse(storedSearches);
        displayRecentSearches();
    }
}

// Display recent searches
function displayRecentSearches() {
    if (recentSearches.length === 0) {
        hideElement(recentSearchesContainer);
        return;
    }
    
    // Clear existing list
    recentSearchesList.innerHTML = '';
    
    // Add each search to the list
    recentSearches.forEach(user => {
        const searchItem = document.createElement('div');
        searchItem.className = 'recent-search-item';
        searchItem.innerHTML = `
            <img src="${user.avatar_url}" alt="${user.login}">
            ${user.name}
        `;
        
        // Add click event
        searchItem.addEventListener('click', () => {
            usernameInput.value = user.login;
            fetchProfile();
        });
        
        recentSearchesList.appendChild(searchItem);
    });
    
    // Show container
    showElement(recentSearchesContainer);
}

// Check API rate limit
function checkRateLimit() {
    fetch('https://api.github.com/rate_limit')
        .then(response => response.json())
        .then(data => {
            const remaining = data.rate.remaining;
            const total = data.rate.limit;
            rateLimitElement.textContent = `${remaining}/${total}`;
            
            // Add warning class if running low
            if (remaining < 10) {
                rateLimitElement.classList.add('rate-limit-warning');
            } else {
                rateLimitElement.classList.remove('rate-limit-warning');
            }
        })
        .catch(error => {
            console.error('Error checking rate limit:', error);
        });
}

// Update URL parameter
function updateURLParameter(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

// Format number with commas for thousands
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Get language color
function getLanguageColor(language) {
    if (!language) return '#ccc';
    
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'C++': '#f34b7d',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33',
        'Rust': '#dea584',
        'Dart': '#00B4AB',
        'Shell': '#89e051',
        'Vue': '#2c3e50',
        'React': '#61dafb',
        'Angular': '#dd1b16'
    };
    
    return colors[language] || '#8257e5';
}

// Show loading spinner
function showLoading() {
    showElement(loadingSpinner);
}

// Hide loading spinner
function hideLoading() {
    hideElement(loadingSpinner);
}

// Show error message
function showError(message) {
    errorContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    showElement(errorContainer);
}

// Show element
function showElement(element) {
    element.classList.remove('hidden');
}

// Hide element
function hideElement(element) {
    element.classList.add('hidden');
}