# Troubleshooting Guide

Solutions to common issues and problems in 4Diary.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Login & Authentication](#login--authentication)
- [Document Issues](#document-issues)
- [Editor Problems](#editor-problems)
- [Kanban Boards](#kanban-boards)
- [Quick Note](#quick-note)
- [Sharing & Collaboration](#sharing--collaboration)
- [Export & Import](#export--import)
- [Performance](#performance)
- [Browser Issues](#browser-issues)
- [Mobile](#mobile)
- [Self-Hosting](#self-hosting)

## Installation & Setup

### MongoDB Connection Fails

**Symptoms**: "Failed to connect to MongoDB" error

**Solutions**:

1. **Verify MongoDB is Running**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Start MongoDB if stopped
   sudo systemctl start mongod
   ```

2. **Check Connection String**
   ```env
   # In .env.local
   MONGODB_URI=mongodb://localhost:27017/4diary
   # Verify format is correct
   ```

3. **Test Connection**
   ```bash
   # Use mongosh to test
   mongosh mongodb://localhost:27017/4diary
   ```

4. **Check Firewall**
   ```bash
   # Ensure port 27017 is open
   sudo ufw allow 27017
   ```

5. **Check MongoDB Logs**
   ```bash
   # View MongoDB logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

### Redis Connection Issues

**Symptoms**: Share feature not working, "Redis connection failed"

**Solutions**:

1. **Verify Redis is Running**
   ```bash
   # Check Redis status
   sudo systemctl status redis
   
   # Start Redis if stopped
   sudo systemctl start redis
   ```

2. **Test Redis Connection**
   ```bash
   # Use redis-cli
   redis-cli ping
   # Should return: PONG
   ```

3. **Check Redis URL**
   ```env
   # In .env.local
   REDIS_URL=redis://localhost:6379
   ```

4. **Redis Authentication**
   ```env
   # If Redis requires password
   REDIS_URL=redis://:password@localhost:6379
   ```

### Port Already in Use

**Symptoms**: "Port 3000 is already in use"

**Solutions**:

1. **Use Different Port**
   ```bash
   PORT=3001 npm run dev
   ```

2. **Find Process Using Port**
   ```bash
   # Linux/Mac
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

3. **Kill Process**
   ```bash
   # Linux/Mac
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

### Dependencies Install Failed

**Symptoms**: `npm install` errors

**Solutions**:

1. **Clear npm Cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use Correct Node Version**
   ```bash
   # Check Node version
   node --version
   # Should be 20.x or higher
   
   # Use nvm to switch
   nvm install 20
   nvm use 20
   ```

3. **Try yarn Instead**
   ```bash
   yarn install
   ```

## Login & Authentication

### Can't Create Account

**Symptoms**: Sign-up button doesn't work

**Solutions**:

1. **Check Email Format**
   - Use valid email format: user@domain.com
   - Avoid special characters in email

2. **Verify Password Requirements**
   - Minimum 8 characters (check actual requirements)
   - May require mix of characters

3. **Check Browser Console**
   - F12 → Console tab
   - Look for error messages
   - May indicate validation issues

4. **Try Different Browser**
   - Test in Chrome/Firefox/Safari
   - Disable extensions temporarily

### Can't Login

**Symptoms**: "Invalid credentials" or login fails

**Solutions**:

1. **Verify Credentials**
   - Check email spelling
   - Verify password (case-sensitive)
   - Check for caps lock

2. **Clear Browser Data**
   ```
   1. Open browser settings
   2. Clear cookies and cache
   3. Restart browser
   4. Try login again
   ```

3. **Check Session Cookies**
   - Ensure cookies are enabled
   - Check for cookie blockers
   - Whitelist 4diary domain

4. **Password Reset** (if available)
   - Click "Forgot Password"
   - Check email for reset link
   - Follow instructions

### Session Expired

**Symptoms**: "Session expired, please log in again"

**Solutions**:

1. **Normal Expiration**
   - Sessions expire after period
   - Simply log in again

2. **Extend Session Time** (Self-hosting)
   ```typescript
   // Increase session duration in config
   maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
   ```

3. **Check for Clock Skew**
   - Verify system time is correct
   - Sync with time server

### Master Key Error

**Symptoms**: "Failed to load master key" or encryption errors

**Solutions**:

1. **Re-login**
   ```
   1. Logout completely
   2. Clear browser data
   3. Login again
   4. Master key regenerated
   ```

2. **Check IndexedDB**
   ```
   1. F12 → Application → IndexedDB
   2. Look for 4diary database
   3. Check keys table
   4. Delete and re-login if corrupted
   ```

3. **Browser Compatibility**
   - Ensure browser supports IndexedDB
   - Update browser to latest version
   - Try different browser

## Document Issues

### Documents Not Loading

**Symptoms**: Blank page or infinite loading

**Solutions**:

1. **Refresh Page**
   - Press F5 or Ctrl+R
   - Hard refresh: Ctrl+Shift+R

2. **Check Network**
   - F12 → Network tab
   - Look for failed requests
   - Check API responses

3. **Clear Browser Cache**
   - Clear cache and reload
   - Try incognito/private mode

4. **Verify Workspace Access**
   - Ensure you're logged in
   - Check workspace permissions

### Documents Not Saving

**Symptoms**: "Failed to save" or changes not persisting

**Solutions**:

1. **Manual Save**
   - Press Ctrl+S
   - Wait for "Saved" indicator

2. **Check Network Connection**
   - Verify internet connectivity
   - Check for network errors in DevTools

3. **Check Server Status**
   - Verify API server is running
   - Check MongoDB connection

4. **Browser Storage Limit**
   - Clear browser storage
   - Check available disk space

### Decryption Fails

**Symptoms**: "Failed to decrypt document" error

**Solutions**:

1. **Verify Master Key**
   ```
   1. Logout and login again
   2. Master key should reload
   3. Try opening document
   ```

2. **Check Document Key**
   - Document may be corrupted
   - Try different document
   - Export and re-import if possible

3. **Browser Compatibility**
   - Ensure Web Crypto API support
   - Update browser
   - Try different browser

### Can't Delete Document

**Symptoms**: Delete button doesn't work

**Solutions**:

1. **Check Permissions**
   - Verify you own the document
   - Shared documents can't be deleted by non-owners

2. **Refresh and Retry**
   - Reload page
   - Try delete again

3. **Check Console for Errors**
   - F12 → Console
   - Look for error messages

## Editor Problems

### Editor Not Loading

**Symptoms**: Blank editor or components missing

**Solutions**:

1. **Check JavaScript Errors**
   - F12 → Console
   - Look for BlockNote errors

2. **Clear Cache**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)

3. **Update Browser**
   - BlockNote requires modern browser
   - Update to latest version

### Formatting Not Working

**Symptoms**: Bold, italic, etc. don't apply

**Solutions**:

1. **Select Text First**
   - Highlight text before formatting
   - Try keyboard shortcuts (Ctrl+B, Ctrl+I)

2. **Check Focus**
   - Click in editor first
   - Ensure editor has focus

3. **Try Markdown**
   - Use markdown syntax: **bold**, *italic*
   - Converts automatically

### Auto-Save Not Working

**Symptoms**: Changes lost after refresh

**Solutions**:

1. **Check Auto-Save Indicator**
   - Look for "Saving..." message
   - Wait for "Saved at [time]"

2. **Manual Save**
   - Press Ctrl+S frequently
   - Don't rely solely on auto-save

3. **Network Issues**
   - Verify connection
   - Check API responses

### Copy/Paste Issues

**Symptoms**: Can't paste or formatting lost

**Solutions**:

1. **Use Paste as Plain Text**
   - Ctrl+Shift+V for plain text
   - Removes source formatting

2. **Try Different Method**
   - Right-click → Paste
   - Edit menu → Paste

3. **Check Browser Permissions**
   - Allow clipboard access
   - Check browser settings

## Kanban Boards

### Board Not Loading

**Symptoms**: Kanban board shows empty or errors

**Solutions**:

1. **Verify Board Type**
   - Document must be type "board"
   - Check document metadata

2. **Check Decryption**
   - Board data must decrypt
   - Try re-logging in

3. **Refresh Board**
   - Close and reopen
   - Refresh page

### Cards Won't Drag

**Symptoms**: Drag and drop not working

**Solutions**:

1. **Check JavaScript**
   - Ensure JavaScript enabled
   - Check console for errors

2. **Browser Compatibility**
   - Update browser
   - Try Chrome/Firefox

3. **Disable Extensions**
   - Temporarily disable browser extensions
   - Test drag and drop again

4. **Touch Devices**
   - Use tap and hold on mobile
   - May need different interaction

### Cards Disappearing

**Symptoms**: Cards vanish after moving

**Solutions**:

1. **Check Network**
   - Verify connection during move
   - Cards save after drop

2. **Refresh Board**
   - Reload to see latest state
   - Lost cards may reappear

3. **Check Board JSON**
   - Export board as JSON
   - Verify card data exists

## Quick Note

### Quick Note Won't Open

**Symptoms**: Ctrl+Q doesn't work

**Solutions**:

1. **Check Key Binding**
   - Verify no conflicts
   - Try clicking button instead

2. **Browser Compatibility**
   - Ensure browser supports shortcuts
   - Try different browser

3. **Check JavaScript**
   - Verify no console errors
   - JavaScript must be enabled

### Content Lost After Close

**Symptoms**: Quick Note content gone

**Solutions**:

1. **Check localStorage**
   - F12 → Application → localStorage
   - Look for quick note data

2. **Browser Cleared Data**
   - LocalStorage may be cleared
   - Always save important notes to workspace

3. **Private/Incognito Mode**
   - localStorage cleared on close
   - Use regular mode for persistence

### Can't Save to Workspace

**Symptoms**: Save button doesn't work

**Solutions**:

1. **Check Login Status**
   - Must be logged in
   - Re-login if needed

2. **Network Connection**
   - Verify internet access
   - Check API responses

3. **Try Manual Process**
   - Copy Quick Note content
   - Create new document
   - Paste content

## Sharing & Collaboration

### Share Button Missing

**Symptoms**: Can't find share option

**Solutions**:

1. **Check Redis**
   - Share requires Redis
   - Verify Redis is configured

2. **Document Type**
   - Ensure document is saved
   - Quick Notes must be saved first

3. **Self-Hosting**
   - Check if feature is enabled
   - Verify environment variables

### Share Link Doesn't Work

**Symptoms**: "Invalid share token" error

**Solutions**:

1. **Check Expiration**
   - Links expire after TTL
   - Request new link

2. **Verify Full URL**
   - Must include # and key
   - Copy entire URL

3. **Check Revocation**
   - Owner may have revoked
   - Contact document owner

### Can't Edit Shared Document

**Symptoms**: "Read-only" despite edit permission

**Solutions**:

1. **Verify Permission Level**
   - Check if actually has edit access
   - Ask owner to verify

2. **Refresh Page**
   - Reload shared document
   - Try editing again

3. **Check Session**
   - May need to access link again
   - Clear browser cache

## Export & Import

### Export Fails

**Symptoms**: Export button doesn't respond

**Solutions**:

1. **Check Document Count**
   - Large workspaces may timeout
   - Try exporting by folder

2. **Browser Memory**
   - Close other tabs
   - Restart browser

3. **Check Console**
   - F12 → Console for errors
   - May indicate specific issue

### Corrupted Export File

**Symptoms**: ZIP won't extract or files damaged

**Solutions**:

1. **Re-download**
   - Try export again
   - Use different browser

2. **Different Extract Tool**
   - Try 7-Zip or The Unarchiver
   - Windows Explorer may fail

3. **Check Disk Space**
   - Ensure enough space
   - Cleanup and retry

### Missing Documents in Export

**Symptoms**: Some documents not in ZIP

**Solutions**:

1. **Check Filters**
   - Verify no filters applied
   - Include archived documents

2. **Document Status**
   - Ensure documents are saved
   - Check for pending saves

3. **Try Individual Export**
   - Export documents separately
   - Combine manually

## Performance

### Slow Loading

**Symptoms**: App takes long to load

**Solutions**:

1. **Clear Browser Cache**
   - Remove old cached data
   - Fresh load may be faster

2. **Check Network Speed**
   - Test internet connection
   - Use faster connection

3. **Reduce Extensions**
   - Disable unnecessary extensions
   - Extensions slow loading

4. **Hardware Acceleration**
   - Enable in browser settings
   - Improves rendering performance

### Slow Typing/Lag

**Symptoms**: Delay between typing and appearance

**Solutions**:

1. **Large Documents**
   - Split into smaller documents
   - Editor slows with length

2. **Browser Performance**
   - Close other tabs
   - Restart browser

3. **Disable Animations**
   - Reduce animations in settings (if available)
   - Improves responsiveness

4. **Check CPU/Memory**
   - Close other applications
   - System resources may be limited

### High Memory Usage

**Symptoms**: Browser using lots of RAM

**Solutions**:

1. **Close Unused Documents**
   - Open only what you need
   - Each document uses memory

2. **Restart Browser**
   - Clear memory leaks
   - Fresh start

3. **Reduce Open Tabs**
   - Limit active tabs
   - Use tab suspend extensions

## Browser Issues

### Incompatible Browser

**Symptoms**: Features not working or errors

**Supported Browsers**:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Solutions**:
1. Update browser to latest version
2. Switch to supported browser
3. Enable required features (JavaScript, cookies, Web Crypto)

### Cookies Blocked

**Symptoms**: Can't stay logged in

**Solutions**:

1. **Enable Cookies**
   ```
   Chrome: Settings → Privacy → Cookies
   Firefox: Settings → Privacy → Cookies
   Safari: Preferences → Privacy → Cookies
   ```

2. **Whitelist Domain**
   - Allow cookies for 4diary domain
   - Add to exceptions list

3. **Third-Party Cookies**
   - May need to allow for features
   - Check privacy settings

### JavaScript Disabled

**Symptoms**: App doesn't work at all

**Solutions**:

1. **Enable JavaScript**
   ```
   Chrome: Settings → Privacy → Site Settings → JavaScript
   Firefox: about:config → javascript.enabled → true
   Safari: Preferences → Security → Enable JavaScript
   ```

2. **Whitelist Domain**
   - Allow JavaScript for 4diary
   - Add to trusted sites

## Mobile

### Touch Not Working

**Symptoms**: Can't tap buttons or interact

**Solutions**:

1. **Refresh Page**
   - Pull down to refresh
   - Try again

2. **Check Screen Protector**
   - May interfere with touch
   - Remove and test

3. **Browser Issues**
   - Try different mobile browser
   - Update browser app

### Zoom Issues

**Symptoms**: Can't zoom or formatting breaks

**Solutions**:

1. **Pinch to Zoom**
   - Use two-finger pinch
   - Browser should allow zoom

2. **Reader Mode**
   - Use Reader Mode for easier reading
   - Built-in font size controls

3. **Browser Settings**
   - Check accessibility settings
   - Adjust text size

### Keyboard Not Appearing

**Symptoms**: Can't type in editor

**Solutions**:

1. **Tap Editor Area**
   - Tap directly in text area
   - May need to tap twice

2. **Reload Page**
   - Refresh and try again
   - May reset input focus

3. **Try Different Browser**
   - Test in Chrome/Safari
   - Browser-specific issue

## Self-Hosting

### Build Fails

**Symptoms**: `npm run build` errors

**Solutions**:

1. **Check Node Version**
   ```bash
   node --version  # Should be 20+
   ```

2. **Clean Install**
   ```bash
   rm -rf node_modules .next
   npm install
   npm run build
   ```

3. **Check Environment**
   ```bash
   # Ensure .env.local exists
   cp .env.example .env.local
   # Fill in required variables
   ```

### Docker Issues

**Symptoms**: Docker containers won't start

**Solutions**:

1. **Check Docker Status**
   ```bash
   docker ps
   docker-compose logs
   ```

2. **Rebuild Containers**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Check Ports**
   ```bash
   # Ensure ports aren't in use
   netstat -an | grep 3000
   netstat -an | grep 27017
   ```

### Production Errors

**Symptoms**: Errors in production that don't occur in development

**Solutions**:

1. **Check Logs**
   ```bash
   # Next.js logs
   pm2 logs
   
   # Or Docker logs
   docker-compose logs -f
   ```

2. **Environment Variables**
   - Verify all required vars set
   - Check for typos

3. **Build Cache**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

## Getting More Help

### Check Documentation

- [User Guides](../README.md)
- [Architecture Docs](../architecture/architecture.md)
- [Security Guide](./security-privacy.md)

### Community Support

- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Discord/Slack: Community chat (if available)

### Debug Mode

Enable verbose logging:

```env
# .env.local
NODE_ENV=development
DEBUG=*
NEXT_PUBLIC_DEBUG=true
```

### Reporting Issues

When reporting bugs, include:

1. **Browser & Version**: Chrome 120, Firefox 115, etc.
2. **Operating System**: Windows 11, macOS 14, Ubuntu 22.04
3. **Steps to Reproduce**: Exact steps that cause issue
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Screenshots**: If applicable
7. **Console Errors**: F12 → Console → copy errors
8. **Network Requests**: F12 → Network → export HAR if needed

### Emergency Recovery

If all else fails:

1. **Export Data** (if possible)
2. **Clear all browser data** for site
3. **Restart browser**
4. **Login fresh**
5. **Import data** back

---

**Last Updated**: November 2025  
**Can't find your issue?** Open a GitHub issue or discussion!
