# Contributing to 4diary

First off, thank you for considering contributing to 4diary! It's people like you that make 4diary such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Security Vulnerabilities

**Please do not report security vulnerabilities through public GitHub issues.** Instead, please refer to our [Security Policy](SECURITY.md) for instructions on how to responsibly disclose security issues.

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain the behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the TypeScript/React coding style
* Include screenshots and animated GIFs in your pull request whenever possible
* Document new code
* End all files with a newline
* Ensure all tests pass

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## CI/CD Workflows

The project uses GitHub Actions for continuous integration and releases:

* **CI Workflow** (`.github/workflows/ci.yml`): Runs on every push and pull request to main branch
  - Lints code with ESLint
  - Builds the project
  - Runs tests with Playwright
  - Tests on Node.js 20.x and 22.x

* **Nightly Release** (`.github/workflows/nightly-release.yml`): Automated nightly builds
  - Runs daily at 2 AM UTC
  - Creates pre-release tags (e.g., `nightly-20250122-020000`)
  - Automatically cleans up old nightly releases (keeps last 7)
  - Excludes commits with message "Initial plan"

* **Main Release** (`.github/workflows/release.yml`): Stable releases
  - Triggered by version tags (e.g., `v1.0.0`, `v0.1.0-alpha`)
  - Can be triggered manually via workflow_dispatch
  - Generates changelog from commits
  - Excludes commits with message "Initial plan"
  - Supports pre-release tags (alpha, beta, rc)

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/4diary.git
cd 4diary

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
# Edit .env.local with your MongoDB URI

# Start development server
npm run dev
```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use TypeScript for all new files
* Follow existing code style
* Use meaningful variable names
* Add JSDoc comments for functions
* Use functional components with hooks

### Testing

* Write tests for new features
* Ensure all tests pass before submitting PR
* Aim for high code coverage

## Project Structure

```
├── app/                # Next.js App Router pages
│   ├── api/           # API routes
│   ├── workspace/     # Workspace pages
│   └── ...
├── components/        # React components
│   ├── editor/       # Editor components
│   └── ui/           # UI components
├── lib/              # Utility libraries
│   ├── crypto/       # Encryption utilities
│   └── ...
└── public/           # Static assets
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
