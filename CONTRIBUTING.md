# Contributing to Outport

Thank you for considering contributing to Outport! Contributions help make the library better for everyone.

---

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/outport.git
cd outport
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

---

## Development Workflow

### Building the Project

After making changes to TypeScript files, build the project:

```bash
npm run build
```

This compiles TypeScript, creates CommonJS bundle, and copies assets.

### Local Testing with npm link

To test your changes in a real Express app:

**In the Outport directory:**

```bash
npm run build
npm link
```

**In your test project:**

```bash
npm link outport
```

Now your test project uses your local Outport version. Rebuild Outport after each change.

### Unlinking

When done testing:

```bash
# In your test project
npm unlink outport

# In the Outport directory
npm unlink
```

---

## Project Structure

```
outport/
├── src/
│   ├── index.ts          # Main Outport class and exports
│   └── public/
│       ├── index.ts      # Documentation page scripts
│       ├── index.html    # Documentation page template
│       ├── index.css     # Styles
│       ├── utils.ts      # Shared utilities
│       ├── render-content.ts  # UI rendering
│       ├── playground/   # Playground page
│       └── services/     # HTTP client
├── lib/                  # Built output (generated)
├── scripts/              # Build scripts
└── package.json
```

---

## Guidelines

### Code Style

- Follow existing code patterns and formatting
- Use TypeScript strict mode
- Add proper type annotations
- Use meaningful variable names

### Commits

- Write clear, descriptive commit messages
- Keep commits focused on a single change
- Reference issue numbers when applicable

### Pull Requests

- Provide a clear description of changes
- Include the problem being solved
- List any breaking changes
- Add tests for new functionality when possible

### Documentation

- Update README.md for new features
- Add JSDoc comments for public APIs
- Include code examples where helpful

### Backward Compatibility

- Avoid breaking existing functionality
- Deprecate before removing features
- Document any migration steps needed

---

## Testing Your Changes

Before submitting a PR, verify:

1. **Build succeeds**: `npm run build`
2. **No TypeScript errors**: Check compiler output
3. **Manual testing**: Test in a real Express app
4. **Documentation**: Update if needed

---

## Reporting Issues

When reporting bugs, include:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Node.js and Express versions
- Relevant code snippets or screenshots

---

## Feature Requests

For new features:

- Describe the use case
- Explain why existing features don't solve it
- Provide examples of desired API/behavior

---

## Getting Help

- **GitHub Issues**: [Open an issue](https://github.com/GMShahzaib/outport/issues)
- **Email**: gms.shahzaib@gmail.com

---

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to Outport!
