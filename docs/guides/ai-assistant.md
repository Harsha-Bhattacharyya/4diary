# AI Assistant Guide

The AI Assistant in 4diary provides privacy-first AI-powered help directly within your notes interface. Powered by DuckDuckGo AI Chat, it offers intelligent suggestions while maintaining your privacy.

## Features

### Privacy-First Design
- **Zero Data Retention**: All queries are sent through DuckDuckGo's privacy-focused AI
- **No Training Data**: Your conversations are never stored or used for AI training
- **Client-Side Only**: AI interactions happen entirely in your browser
- **No API Keys**: Works out-of-the-box without any configuration

### Context-Aware Assistance
- Understands your current document content
- Provides relevant suggestions based on context
- Helps with writing, editing, and brainstorming
- Answers questions about your notes

### Notion-Style Interface
- Clean, modal-based chat interface
- Smooth animations and transitions
- Mobile-responsive design
- Keyboard shortcuts for quick access

## How to Use

### Opening the AI Assistant

There are two ways to open the AI Assistant:

1. **Keyboard Shortcut**: Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac)
2. **Floating Button**: Click the sparkle ✨ button in the bottom-right corner of the editor

### Chatting with the AI

1. Type your question or request in the input field
2. Press `Enter` to send (or `Shift+Enter` for a new line)
3. Wait for the AI response
4. Continue the conversation as needed

### Example Prompts

#### Writing Help
- "Help me improve this paragraph"
- "Suggest a better way to phrase this"
- "Give me ideas for expanding this section"

#### Content Generation
- "Write a brief introduction about [topic]"
- "Create an outline for an article about [subject]"
- "Suggest bullet points for [idea]"

#### Editing & Proofreading
- "Check this for grammar mistakes"
- "Make this more concise"
- "Rephrase this in a professional tone"

#### Research & Brainstorming
- "What are the main points about [topic]?"
- "Give me ideas for [project]"
- "Explain [concept] in simple terms"

## Features & Controls

### Message History
- All messages in the current session are displayed
- Scroll through conversation history
- Timestamps show when each message was sent

### Clear Chat
- Click "Clear" button to start a fresh conversation
- Previous messages are removed
- Context resets to current document

### Close Assistant
- Press `Esc` key to close
- Click the `X` button in the top-right
- Click outside the modal to dismiss

## Context-Aware Suggestions

The AI Assistant automatically includes context from your current document:

- Sends the first 1000 characters of your document as context
- Helps provide more relevant and specific suggestions
- Works seamlessly in the background

**Note**: Context is only sent with your query and is not stored or used for training.

## Privacy & Security

### What Gets Sent
- Your prompt/question
- Relevant document context (first 1000 chars)
- No personal information
- No document metadata

### What Doesn't Get Sent
- Full document content
- Other documents in your workspace
- User information or credentials
- Encryption keys

### DuckDuckGo AI Privacy
- No personal data collection
- No tracking or profiling
- No data retention for training
- Privacy-first AI provider

## Limitations

- Requires internet connection to work
- Limited to text-based interactions
- Context limited to current document
- No long-term memory between sessions
- No access to external documents or web search

## Self-Hosting Considerations

The AI Assistant is fully compatible with self-hosted instances:

- **No Configuration Required**: Works immediately after installation
- **No API Keys**: No third-party accounts or API keys needed
- **No Vendor Lock-In**: Can be disabled or removed if desired
- **Privacy Maintained**: All queries go through DuckDuckGo's privacy-focused endpoint

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` (or `Cmd+Shift+A`) | Toggle AI Assistant |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Esc` | Close AI Assistant |

## Troubleshooting

### AI Assistant Won't Open
- Make sure you're in a document edit mode
- Check if the floating ✨ button is visible
- Try refreshing the page
- Check browser console for errors

### No Response from AI
- Check your internet connection
- Wait a moment and try again
- Clear the chat and start fresh
- Try a simpler prompt

### Slow Responses
- DuckDuckGo AI may be experiencing high load
- Try again after a few moments
- Consider shorter prompts for faster responses

## Best Practices

1. **Be Specific**: Clear, specific prompts get better responses
2. **Provide Context**: Mention what you're working on or what you need
3. **Iterate**: Refine your prompts based on the responses you get
4. **Keep It Short**: Shorter prompts often get faster, clearer responses
5. **Use Clear Chat**: Start fresh when changing topics

## Future Enhancements

Planned features for future releases:

- [ ] Multi-turn conversation memory
- [ ] Document-wide context (full document, not just first 1000 chars)
- [ ] Selected text suggestions
- [ ] Template generation
- [ ] Grammar and style checking
- [ ] Customizable AI preferences

---

**Remember**: The AI Assistant is designed to help, not replace your creativity. Use it as a tool to enhance your writing and thinking, but always review and refine the suggestions to match your voice and needs.
