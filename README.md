# Caido Headers & Cookies Manager Plugin

A powerful Caido plugin that provides a sidebar interface for managing custom headers and cookies, with seamless integration into the Repeater/Replay tool.

## Features

- **Sidebar UI**: Clean, intuitive interface for managing headers and cookies
- **Key-Value Input**: Easy-to-use input fields for adding multiple headers and cookies
- **Persistent Storage**: Automatically saves your headers and cookies
- **Repeater Integration**: Select multiple Repeater tabs to apply changes
- **Bulk Operations**: Send multiple modified requests at once
- **Real-time Feedback**: Status messages for save and run operations

## Installation

### Prerequisites

- [Caido](https://caido.io/) installed and running
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager

### Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### Quick Installation

**The fastest way to build and install:**

```bash
# 1. Install dependencies
pnpm install

# 2. Build and package the plugin
pnpm run release

# 3. Install caido-headers-sidebar.zip in Caido
# Go to Caido → Settings → Plugins → Install from file
```

For detailed installation instructions, troubleshooting, and platform-specific guides, see **[INSTALL.md](INSTALL.md)**.

### Manual Build Steps

If you prefer to build step-by-step:

1. **Install dependencies:**
```bash
pnpm install
```

2. **Build the plugin:**
```bash
pnpm run build
```

3. **Package into zip:**
```bash
pnpm run package
```

This creates `caido-headers-sidebar.zip` with the correct structure for Caido.

### Install in Caido

1. Open Caido and navigate to **Settings** → **Plugins**
2. Click **"Install from file"** or **"Add Plugin"**
3. Select the `caido-headers-sidebar.zip` file
4. The plugin should now appear in your sidebar as "Headers Manager"

**Important:** Caido requires a properly structured zip file. The packaging scripts ensure the correct structure automatically.

## Usage

### 1. Access the Plugin

After installation, you'll find "Headers Manager" in the right sidebar of Caido's interface.

### 2. Add Custom Headers

1. Click the **Headers Manager** sidebar item
2. Enter header names and values in the input fields
3. Click **+ Add Header** to add more header rows
4. Click the **✕** button to remove unwanted headers

Example headers:
```
Authorization: Bearer your-token-here
X-Custom-Header: custom-value
User-Agent: Custom-Agent/1.0
```

### 3. Add Custom Cookies

1. In the "Custom Cookies" section, enter cookie names and values
2. Click **+ Add Cookie** to add more cookie rows
3. Click the **✕** button to remove unwanted cookies

Example cookies:
```
sessionId: abc123def456
userId: 12345
authToken: xyz789
```

### 4. Save Configuration

Click the **Save** button to persist your headers and cookies. They will be automatically loaded the next time you open the plugin.

### 5. Select Repeater Tabs

1. Click **Refresh Tabs** to load available Repeater tabs
2. Check the boxes next to the tabs you want to modify
3. Use **Select All** or **Deselect All** for bulk selection

### 6. Run Modified Requests

1. Ensure you have selected at least one Repeater tab
2. Click the **Run** button (shows the count of selected tabs)
3. The plugin will:
   - Apply your custom headers to each selected request
   - Merge your custom cookies with existing cookies
   - Send all modified requests to the server
4. A status message will show the number of requests sent

## Plugin Architecture

### Frontend (`src/frontend/index.tsx`)

- React-based sidebar UI
- Manages user input for headers and cookies
- Handles local storage of configurations
- Communicates with backend via Caido SDK

### Backend (`src/backend/index.ts`)

- Node.js backend using Caido SDK
- Retrieves Repeater tab information
- Modifies HTTP requests with custom headers/cookies
- Sends modified requests to target servers
- Provides RPC endpoints for frontend communication

### Configuration (`manifest.json`)

Defines plugin metadata:
- Plugin ID and name
- Frontend and backend entry points
- Plugin version and author information

## Development

### Project Structure

```
caido-headers-sidebar-plugin/
├── manifest.json           # Plugin metadata
├── package.json           # npm/pnpm configuration
├── tsconfig.json          # TypeScript configuration
├── src/
│   ├── frontend/
│   │   └── index.tsx      # React frontend code
│   └── backend/
│       └── index.ts       # Node.js backend code
└── dist/
    ├── frontend.js        # Compiled frontend
    ├── backend.js         # Compiled backend
    └── styles.css         # Plugin styles
```

### Build Commands

```bash
# Build entire plugin
pnpm run build

# Build frontend only
pnpm run build:frontend

# Build backend only
pnpm run build:backend

# Watch mode (auto-rebuild on changes)
pnpm run watch

# Clean build artifacts
pnpm run clean
```

### Adding New Features

1. Frontend changes: Edit `src/frontend/index.tsx`
2. Backend changes: Edit `src/backend/index.ts`
3. Rebuild with `pnpm run build`
4. Reload plugin in Caido

## API Reference

### Frontend to Backend Communication

The frontend communicates with the backend using these RPC methods:

#### `getRepeaterTabs()`
Returns an array of available Repeater tab IDs.

```typescript
const tabs = await caido.backend.getRepeaterTabs();
```

#### `modifyAndSendRequests(params)`
Modifies and sends requests with custom headers and cookies.

```typescript
interface ModifyRequestsParams {
  headers: Array<{ key: string; value: string }>;
  cookies: Array<{ key: string; value: string }>;
  tabs: string[];
}

const result = await caido.backend.modifyAndSendRequests({
  headers: [{ key: "Authorization", value: "Bearer token" }],
  cookies: [{ key: "session", value: "abc123" }],
  tabs: ["tab1", "tab2"]
});
```

### Storage API

The plugin uses Caido's storage API to persist data:

```typescript
// Save data
await caido.storage.set("headers-cookies-data", JSON.stringify(data));

// Load data
const data = await caido.storage.get("headers-cookies-data");
```

## Troubleshooting

### Plugin Not Appearing

1. Verify the plugin is in the correct directory
2. Check that `manifest.json` is valid JSON
3. Restart Caido
4. Check Caido's plugin logs for errors

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

### Headers Not Being Applied

1. Verify headers are saved (check status message)
2. Ensure Repeater tabs are selected
3. Check browser console for errors (F12)
4. Verify backend logs in Caido

### No Repeater Tabs Showing

1. Open at least one request in Repeater
2. Click the "Refresh Tabs" button
3. Ensure Caido has active Repeater instances

## Compatibility

- **Caido Version**: 0.30.0 or higher
- **Node.js**: 18.x or higher
- **pnpm**: 8.x or higher

## Security Considerations

- Headers and cookies are stored locally within Caido
- Data is not transmitted to external services
- Be cautious when storing sensitive tokens
- Review all headers before sending requests
- Use HTTPS for production environments

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact the maintainer
- Check Caido's official documentation

## Changelog

### Version 1.0.0
- Initial release
- Sidebar UI for headers and cookies
- Repeater integration
- Bulk request sending
- Persistent storage

## Acknowledgments

- Built with [Caido SDK](https://docs.caido.io/)
- Uses React for frontend UI
- Powered by TypeScript and esbuild

---

**Note**: This plugin is in active development. Some features may require specific Caido API methods that are version-dependent. Ensure you're using a compatible version of Caido for full functionality.
