# Qwen VSCode Chat

A VS Code extension that integrates Qwen and other Alibaba Cloud language models directly into your code editor. Chat with AI models, get code suggestions, and leverage AI assistance without leaving your development environment.

## Features

### 🤖 AI Chat Integration
- Seamless integration with Qwen language models hosted on Alibaba Cloud
- Chat interface directly within VS Code
- Support for multiple Qwen models

### 🔑 Easy API Key Management
- Simple command to manage your Alibaba Cloud API keys
- Secure storage using VS Code's secret storage
- Quick setup and configuration

### 💬 Interactive Chat
- Real-time conversation with AI models
- Context-aware responses
- Markdown formatting support

### 🛠️ Developer Tools
- Code analysis and suggestions
- Natural language to code translation
- Documentation assistance

## Requirements

To use this extension, you need:

1. **Alibaba Cloud Account**: Sign up at [Alibaba Cloud](https://www.alibabacloud.com/)
2. **Qwen API Access**: Obtain API credentials from Alibaba Cloud console
3. **VS Code 1.109.0 or higher**: The extension requires this minimum version

## Installation

1. Install the extension from the VS Code Marketplace
2. Run the command `Qwen: Manage API Key` from the command palette
3. Enter your Alibaba Cloud Qwen API key
4. Start chatting with Qwen models!

## Usage

### Managing API Keys

1. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Search for "Qwen: Manage API Key"
3. Enter your Alibaba Cloud Qwen API key when prompted
4. Your API key will be securely stored

### Starting a Chat

1. Open the chat view in VS Code (click the chat icon in the activity bar)
2. Select "Qwen" as your chat provider
3. Start typing your questions or requests
4. Receive AI-powered responses directly in your editor

## Commands

- `qwen.manage`: Manage your Qwen API key
- `qwen.helloWorld`: Test command to verify extension installation

## Extension Settings

This extension currently doesn't add any VS Code settings through `contributes.configuration`. All configuration is handled through the API key management command.

## Security

- API keys are stored securely using VS Code's built-in secret storage
- Keys are never logged or transmitted anywhere except to Alibaba Cloud's official API endpoints
- You can clear your API key at any time using the manage command

## Supported Models

The extension supports various Qwen models hosted on Alibaba Cloud platform. The specific models available depend on your Alibaba Cloud subscription.

## Troubleshooting

### API Key Issues

If you encounter authentication errors:
1. Verify your API key is correct
2. Check your Alibaba Cloud account status
3. Ensure your subscription includes Qwen API access

### Connection Problems

If the extension can't connect to Qwen services:
1. Check your internet connection
2. Verify Alibaba Cloud services are operational
3. Try restarting VS Code

## Development

### Building the Extension

To build and package this extension for local development or distribution:

1. First, ensure you have `vsce` (Visual Studio Code Extension Manager) installed globally:
   ```bash
   npm install -g @vscode/vsce
   ```

2. Then, navigate to your extension directory and package it:
   ```bash
   vsce package --no-dependencies
   ```

   The `--no-dependencies` flag creates a lighter package without bundling dependencies that might be resolved at runtime.

3. To install the packaged extension locally for testing:
   ```bash
   code --install-extension <path-to-packaged-extension.vsix>
   ```

   Replace `<path-to-packaged-extension.vsix>` with the actual path to the generated .vsix file.

4. Reload VS Code or restart it to start using your locally installed version of the extension.

### Local Development

For active development, you can also run the extension in development mode:
1. Open this folder in VS Code
2. Press `F5` to open a new window with the extension loaded
3. Make changes to the code and reload the extension window to see updates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Release Notes

### 0.1.0

- Initial release
- Basic Qwen chat provider integration
- API key management
- Hello World test command

## Support

For issues, questions, or feature requests:

- Open an issue on [GitHub](https://github.com/nguyenlean96/qwen-vscode-chat/issues)
- Check the [documentation](docs/)

## Acknowledgements

- Thanks to Alibaba Cloud for providing the Qwen language models
- Built with VS Code's language model chat provider API
- Inspired by the growing ecosystem of AI-powered development tools
