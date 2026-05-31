# Contributing to NextERP

First off, thank you for considering contributing! This is an open-source project and we welcome contributions of all kinds.

## How to Contribute

### Reporting Bugs
- Check if the issue already exists
- Open a new issue with a clear description, steps to reproduce, and expected behavior
- Include screenshots if applicable

### Suggesting Features
- Open an issue with the `enhancement` label
- Describe the use case and expected behavior

### Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run the test suite: `npm run build` (this also runs TypeScript checks)
5. Commit with [Conventional Commits](https://www.conventionalcommits.org/) style:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation
   - `refactor:` code restructuring
   - `style:` formatting
6. Push and open a Pull Request against `main`

## Development Setup

See the [README](./README.md) for full setup instructions.

### Code Style
- TypeScript with strict mode
- Tailwind CSS for styling
- Follow existing patterns in the codebase
- Use server actions for data mutations
- Use Drizzle ORM for database queries

### Project Conventions
- Co-locate related files (page, actions, components)
- Use `"use client"` only when needed (forms, interactivity)
- Keep server components as the default
- Use the existing shadcn/ui component patterns

## Code of Conduct

Be respectful, constructive, and professional in all interactions.
