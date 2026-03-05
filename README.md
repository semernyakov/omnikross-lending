# OmniKross Landing Page

AI-powered content adaptation platform landing page with modern build system and feature-based architecture.

## 🚀 Features

- **Multi-language support** (Russian/English)
- **Role-based selection** (Agency/Solo)
- **Modern build system** with Bun
- **Feature-based architecture**
- **Automated testing** with Bun test
- **Security hardening** with CSP headers
- **Performance optimization** with minification
- **TypeScript support**

## 📁 Project Structure

```text
omnikross-landing/
├── public/                 # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── assets/            # Images and icons
│   ├── en/                # English pages
│   └── ru/                # Russian pages
├── src/                   # Source code
│   ├── features/          # Feature modules
│   │   ├── language-selector/
│   │   └── role-selector/
│   ├── shared/            # Shared utilities
│   │   ├── config/
│   │   └── utils/
│   └── main.js           # Application entry point
├── test/                  # Test files
├── dist/                  # Build output
└── build.js              # Custom build script
```

## � Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd omnikross-landing

# 2. Install dependencies
bun install

# 3. Start development
bun run dev

# 4. Build for production
bun run build

# 5. Test the build
bun run preview
```

## �️ Development

### Prerequisites

- [Bun](https://bun.sh/) runtime
- Node.js (optional, for some tools)

### Setup

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Lint code
bun run lint

# Format code
bun run format
```

### Build

```bash
# Build for production
bun run build

# Preview build
bun run preview

# Build frontend only
bun run build:frontend

# Build CSS only
bun run build:css
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# API Configuration
API_BASE_URL=https://api.omnikross.ru

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_AB_TESTING=true
ENABLE_LIVE_CHAT=true

# Build Configuration
NODE_ENV=production
```

### Build Configuration

Edit `bunfig.toml` for custom build settings:

```toml
[build]
target = "browser"
minify = true
sourcemap = true
```

## 🏗️ Architecture

### Feature-Based Structure

The project uses a feature-based architecture for better scalability:

- **LanguageSelector**: Handles language selection logic
- **RoleSelector**: Manages role selection and features
- **ConfigManager**: Centralized configuration management
- **MainController**: Orchestrates all features

### Security Features

- **Content Security Policy** headers
- **Subresource Integrity** hashes
- **XSS protection** headers
- **Frame protection** (X-Frame-Options)
- **Content-Type protection** (X-Content-Type-Options)

## 📊 Performance

- **Bundle size**: < 100KB (minified)
- **Load time**: < 2s (Lighthouse)
- **First Contentful Paint**: < 1.5s
- **Accessibility**: 100% (Lighthouse)

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t omnikross-landing .

# Run container
docker run -p 3000:3000 omnikross-landing
```

### Manual Deployment

```bash
# Build project
bun run build

# Deploy dist/ folder to your web server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun test`
5. Submit a pull request

## 📝 Scripts

| Script    | Description              |
| --------- | ------------------------ |
| `dev`     | Start development server |
| `build`   | Build for production     |
| `test`    | Run tests                |
| `lint`    | Lint code                |
| `format`  | Format code              |
| `preview` | Preview build            |

## 🔍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

MIT License - see LICENSE file for details.

## 🔧 Troubleshooting

### Common Issues

#### Build fails

```bash
# Clear cache and reinstall
rm -rf node_modules .bun-cache
bun install
bun run build
```

#### Tests not running

```bash
# Ensure test files are in correct location
test/
├── setup.js
└── index.test.js
```

#### ESLint errors

```bash
# Auto-fix linting issues
bun run lint:fix
```

#### Format issues

```bash
# Format all files
bun run format
```

### Development Tips

- Use `bun run dev` for hot reload during development
- Run `bun test` before committing changes
- Check `bun run build` works before deploying
- Use browser dev tools to debug production builds

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team

---

Built with ❤️ using [Bun](https://bun.sh/) and modern web technologies.
