# Multi-Language Support

4diary supports multiple languages through integration with lingo.dev translation service. This feature allows users to choose their preferred language for the application interface.

## Supported Languages

Currently implemented languages (Phase 1):
- **English** (en) - English
- **Bengali** (bn) - বাংলা  
- **Hindi** (hi) - हिन्दी

Planned for future releases (Phase 2):
- Tamil (ta) - தமிழ்
- Mandarin (zh) - 中文
- Russian (ru) - Русский
- French (fr) - Français
- German (de) - Deutsch

## Configuration

### For Self-Hosting

To enable translation features when self-hosting 4diary:

1. **Get a lingo.dev API Key**
   - Visit [lingo.dev](https://lingo.dev) and sign up
   - Generate an API key from your dashboard
   - Free tier available for basic usage

2. **Configure Environment Variable**
   Add the following to your `.env.local` file:
   ```bash
   LINGO_API_KEY=your_api_key_here
   ```

3. **Restart Application**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### For Cloud Deployment

Add the `LINGO_API_KEY` environment variable in your deployment platform:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Docker**: Add to your `.env` file or docker-compose.yml

## Usage

### Changing Language Preference

1. Navigate to **Settings** page (click your profile icon → Settings)
2. Scroll to the **Appearance** section
3. Find the **Language** dropdown
4. Select your preferred language
5. The preference is automatically saved

### Translation Service Status

The Settings page displays the translation service status:
- ✅ **Available**: Translation service is configured and ready
- ⚠️ **Not Configured**: LINGO_API_KEY is not set

## API Reference

### Translation Endpoint

**POST** `/api/translate`

Translate text from one language to another.

#### Request Body

```json
{
  "text": "Hello, world!",
  "sourceLang": "en",
  "targetLang": "bn"
}
```

Or batch translation:

```json
{
  "text": ["Hello", "Welcome", "Settings"],
  "sourceLang": "en",
  "targetLang": "hi"
}
```

#### Response

Single translation:
```json
{
  "translatedText": "হ্যালো, বিশ্ব!",
  "sourceLang": "en",
  "targetLang": "bn",
  "cached": false
}
```

Batch translation:
```json
{
  "translations": [
    {
      "translatedText": "नमस्ते",
      "sourceLang": "en",
      "targetLang": "hi",
      "cached": false
    }
  ],
  "count": 3
}
```

### Get Supported Languages

**GET** `/api/translate`

Get translation service status and list of supported languages.

#### Response

```json
{
  "available": true,
  "supportedLanguages": {
    "en": {
      "code": "en",
      "name": "English",
      "nativeName": "English"
    },
    "bn": {
      "code": "bn",
      "name": "Bengali",
      "nativeName": "বাংলা"
    },
    "hi": {
      "code": "hi",
      "name": "Hindi",
      "nativeName": "हिन्दी"
    }
  },
  "message": "Translation service is available"
}
```

## Technical Details

### Architecture

- **Service Layer**: `lib/translationService.ts` handles all translation logic
- **API Route**: `/api/translate` provides REST endpoint for translations
- **Caching**: In-memory cache stores up to 1000 translations to reduce API calls
- **Database**: User language preference stored in workspace document

### Performance Optimizations

1. **In-Memory Caching**: Frequently used translations are cached to minimize API calls
2. **Same-Language Detection**: If source and target languages are identical, returns original text without API call
3. **Batch Processing**: Multiple texts can be translated in a single API call
4. **Cache Statistics**: Monitor cache utilization with `getTranslationCacheStats()`

### Security

- **API Key Security**: API key is stored server-side only, never exposed to client
- **Input Validation**: All inputs are validated before processing
- **Rate Limiting**: Batch translations processed sequentially to avoid rate limits
- **Error Handling**: Graceful fallback to original text on translation failures

## Privacy Considerations

### Zero-Knowledge Architecture Maintained

4diary's core zero-knowledge architecture is preserved:
- **Document Content**: Remains fully encrypted end-to-end
- **Translation Service**: Only used for UI elements and metadata
- **User Data**: Only language preference is stored (unencrypted)
- **No PII**: Translation service never receives personal information

### What Gets Translated

✅ **Translated**:
- Application interface labels
- Menu items and buttons
- Settings descriptions
- Help text and tooltips

❌ **Not Translated**:
- Encrypted document content (remains E2E encrypted)
- User-generated notes and titles
- Personal data

## Troubleshooting

### Translation Service Not Available

**Problem**: Settings page shows "Translation service not configured"

**Solutions**:
1. Verify `LINGO_API_KEY` is set in environment variables
2. Check API key is valid on lingo.dev dashboard
3. Restart application after adding environment variable
4. Check server logs for connection errors

### Language Not Saving

**Problem**: Selected language reverts to English

**Solutions**:
1. Ensure you're logged in (language preference requires authentication)
2. Check browser console for errors
3. Verify workspace exists in database
4. Clear browser cache and try again

### API Rate Limits

**Problem**: Translation requests failing with rate limit errors

**Solutions**:
1. Upgrade lingo.dev plan for higher rate limits
2. Utilize caching to reduce API calls
3. Use batch translation for multiple texts
4. Implement request throttling if needed

## Self-Hosting Without Translation

Translation is **optional** and does not affect core functionality:
- Application works perfectly without `LINGO_API_KEY`
- Interface defaults to English
- All other features remain fully functional
- No vendor lock-in - easily switch translation providers

## Future Enhancements

Planned features for translation support:

1. **Document Translation** (Post-Alpha)
   - Optional translation of document titles
   - Maintains E2E encryption
   - User-initiated only

2. **Additional Languages** (Phase 2)
   - Tamil, Mandarin, Russian, French, German
   - Community-requested languages

3. **Offline Translation** (Future)
   - Local translation models for offline use
   - Reduced API dependency

4. **Custom Translations**
   - User-provided translations
   - Community translation contributions

## Alternative Translation Services

To avoid vendor lock-in, you can modify the translation service to use:
- **DeepL API**: High-quality translation
- **Google Translate API**: Wide language support
- **LibreTranslate**: Self-hosted, open-source
- **Azure Translator**: Enterprise-grade

To switch providers:
1. Modify `lib/translationService.ts`
2. Update API endpoint and request format
3. Change environment variable name if desired
4. Test with your API key

## Support

For translation-related issues:
- Check [Troubleshooting Guide](./troubleshooting.md)
- Review lingo.dev documentation
- Open an issue on GitHub
- Contact support team

## License

Translation feature is part of 4diary and licensed under BSD-3-Clause.
See [LICENSE](../../LICENSE) for details.
