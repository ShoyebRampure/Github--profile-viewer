# GitHub Profile Explorer

A sleek, feature-rich web application that allows users to search for and view detailed GitHub profiles along with repository information. This project uses the GitHub API to fetch and display user data in an attractive, responsive interface.

## 🌟 Features

- **User Search:** Search for any GitHub user by username
- **Detailed Profile Information:**
  - Profile picture and bio
  - Name and username
  - Location
  - Account creation date
  - Followers and following counts
  - Repository and gist counts
- **Repository Exploration:**
  - View repositories with detailed information
  - Filter repositories by programming language
  - Sort repositories by stars, forks, or last updated
  - Pagination for better navigation of large repository collections
- **User Experience:**
  - Dark/light theme toggle with theme persistence
  - Recent searches history
  - Popular users quick access
  - Loading indicators and error handling
  - Mobile-responsive design
- **API Integration:**
  - GitHub REST API integration
  - Rate limit display and warnings

## 🚀 Live Demo

Try the application live: [GitHub Profile Explorer](https://shoyebrampure.github.io/Github--profile-viewer/)

## 🖼️ Screenshots

<div style="display: flex; gap: 10px;">
  <img src="screenshots/light-theme.png" alt="Light Theme" width="45%">
  <img src="screenshots/dark-theme.png" alt="Dark Theme" width="45%">
</div>
<div style="display: flex; gap: 10px; margin-top: 10px;">
  <img src="screenshots/mobile-view.png" alt="Mobile View" width="30%">
  <img src="screenshots/repositories.png" alt="Repositories View" width="60%">
</div>

## 💻 Technologies Used

- **HTML5** - Semantic structure
- **CSS3** - Styling and animations
- **JavaScript** - Dynamic functionality
- **GitHub REST API** - Data retrieval
- **Font Awesome** - Icons
- **Google Fonts** - Typography
- **LocalStorage API** - Theme preference and search history persistence

## 🛠️ Setup and Installation

```bash
# Clone the repository
git clone https://github.com/ShoyebRampure/Github--profile-viewer.git

# Navigate to the project directory
cd Github--profile-viewer

# Open the project
# Simply open index.html in your browser
```

## 📝 How to Use

1. Enter a GitHub username in the search box
2. Press Enter or click the "Explore" button
3. View the user's profile information
4. Click "View Repositories" to see the user's repositories
5. Filter repositories by language or sort them by stars, forks, or update date
6. Use pagination to navigate through repositories
7. Toggle between light and dark themes using the theme switch in the top-right corner
8. Click on any recent search to quickly view that profile again

## 📊 API Usage

This project uses the following GitHub API endpoints:

- User information: `https://api.github.com/users/{username}`
- User repositories: `https://api.github.com/users/{username}/repos`
- API rate limit: `https://api.github.com/rate_limit`

## ⚠️ Limitations

- GitHub API has a rate limit of 60 requests per hour for unauthenticated requests
- The application displays up to 100 repositories per user due to API pagination constraints

## 🔮 Future Enhancements

- OAuth implementation to increase API rate limit
- Advanced repository filtering
- User activity timeline visualization
- Repository code preview
- Starring repositories directly from the application
- Compare multiple GitHub profiles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [GitHub API](https://docs.github.com/en/rest) for providing the data
- [Font Awesome](https://fontawesome.com/) for the icons
- [Google Fonts](https://fonts.google.com/) for the typography
- [Poppins Font](https://fonts.google.com/specimen/Poppins) by Indian Type Foundry
