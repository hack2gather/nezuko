# Contributing to Caido Headers & Cookies Manager

Thank you for your interest in contributing to this plugin! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Caido installed locally
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/caido-headers-sidebar-plugin.git
   cd caido-headers-sidebar-plugin
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Build the plugin:
   ```bash
   pnpm run build
   ```

## Development Workflow

### Making Changes

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the appropriate files:
   - Frontend: `src/frontend/index.tsx`
   - Backend: `src/backend/index.ts`
   - Styles: `dist/styles.css`

3. Build and test your changes:
   ```bash
   pnpm run build
   ```

4. Test in Caido by reloading the plugin

### Code Style

- Use TypeScript for all source files
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### TypeScript Guidelines

```typescript
// Good: Explicit types
interface HeaderEntry {
  key: string;
  value: string;
}

function addHeader(header: HeaderEntry): void {
  // Implementation
}

// Avoid: Implicit any types
function addHeader(header) {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components focused on single responsibility
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

```typescript
// Good
interface Props {
  caido: Caido;
}

const Component: React.FC<Props> = ({ caido }) => {
  // Implementation
};

// Avoid
const Component = (props: any) => {
  // Implementation
};
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test the following:

- [ ] Plugin loads without errors
- [ ] Can add/remove headers
- [ ] Can add/remove cookies
- [ ] Save button persists data
- [ ] Data is restored on reload
- [ ] Can select/deselect Repeater tabs
- [ ] Run button sends requests correctly
- [ ] Status messages display properly
- [ ] UI is responsive and user-friendly
- [ ] No console errors

### Testing in Caido

1. Build the plugin:
   ```bash
   pnpm run build
   ```

2. Copy to Caido's plugin directory:
   ```bash
   # macOS/Linux
   cp -r . ~/.caido/plugins/caido-headers-sidebar/

   # Windows
   xcopy . %APPDATA%\caido\plugins\caido-headers-sidebar\ /E /I
   ```

3. Reload Caido or restart it

4. Open the Headers Manager sidebar

5. Test all functionality

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```
Good:
✓ Add support for bulk header deletion
✓ Fix cookie merging bug when multiple values exist
✓ Update UI to match Caido's design system

Bad:
✗ fix bug
✗ update code
✗ changes
```

### Pull Request Process

1. Ensure your code builds without errors:
   ```bash
   pnpm run build
   ```

2. Update documentation if needed:
   - README.md for user-facing changes
   - Code comments for implementation details

3. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request with:
   - Clear title describing the change
   - Description of what changed and why
   - Screenshots for UI changes
   - Reference any related issues

5. Wait for review and address feedback

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code builds without errors
- [ ] Tested in Caido
- [ ] Updated documentation
- [ ] No console errors
```

## Reporting Bugs

### Bug Report Template

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**:
   - Step 1
   - Step 2
   - etc.
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - Caido version
   - Plugin version
   - Operating system
   - Browser (if frontend issue)
6. **Screenshots**: If applicable
7. **Console Errors**: Any error messages

## Feature Requests

### Feature Request Template

1. **Feature Description**: What feature you'd like
2. **Use Case**: Why this feature is needed
3. **Proposed Solution**: How it might work
4. **Alternatives**: Other solutions considered
5. **Additional Context**: Any other relevant info

## Code Review Process

### What We Look For

- Code quality and readability
- Proper TypeScript usage
- Following existing patterns
- Documentation updates
- No breaking changes (unless necessary)
- Performance considerations
- Security implications

### Review Timeline

- Initial review: Within 1-3 days
- Follow-up reviews: Within 1-2 days
- Merge timeline: Varies based on complexity

## Architecture Guidelines

### Frontend (React)

```typescript
// State management
const [state, setState] = useState<Type>(initialValue);

// Side effects
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup
  };
}, [dependencies]);

// Event handlers
const handleEvent = async () => {
  try {
    // Implementation
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### Backend (Node.js)

```typescript
// Class-based organization
export class HeadersManagerBackend {
  private sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  async method(): Promise<ReturnType> {
    try {
      // Implementation
    } catch (error) {
      this.sdk.console.error("Error:", error);
      throw error;
    }
  }
}

// RPC registration
export function init(sdk: SDK) {
  const backend = new HeadersManagerBackend(sdk);

  sdk.api.register("methodName", async (params) => {
    return await backend.method();
  });
}
```

### Communication Pattern

Frontend → Backend communication:

```typescript
// Frontend
const result = await caido.backend.methodName(params);

// Backend
sdk.api.register("methodName", async (params) => {
  // Handle request
  return result;
});
```

## Questions?

If you have questions:
- Open an issue for discussion
- Check existing issues and PRs
- Review Caido's official documentation
- Ask in the Caido community

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions

Thank you for contributing!
