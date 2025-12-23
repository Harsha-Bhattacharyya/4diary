# Bot Protection Guide

4diary supports optional Cloudflare Turnstile bot protection for login pages. This feature is completely optional and designed with self-hostability in mind - your instance works perfectly without it.

## Features

### Optional & Self-Hostable
- **No Vendor Lock-In**: Works without Turnstile if not configured
- **Free Tier**: Cloudflare Turnstile offers generous free tier
- **Privacy-Friendly**: Turnstile is more privacy-focused than reCAPTCHA
- **Self-Hosted Compatible**: Easy to enable/disable on self-hosted instances

### Security Benefits
- **Bot Protection**: Prevents automated bot attacks on login
- **Brute Force Mitigation**: Adds extra layer against brute force attacks
- **CAPTCHA Alternative**: Modern, privacy-friendly alternative to traditional CAPTCHAs
- **User-Friendly**: Lightweight and fast challenge verification

## How It Works

### Without Turnstile (Default)
When Turnstile is not configured:
1. Users can log in normally
2. No additional verification required
3. Rate limiting still applies (3 attempts, 15-minute lockout)
4. Full functionality maintained

### With Turnstile (Optional)
When Turnstile is configured:
1. Login page displays Turnstile widget
2. User completes challenge (usually invisible)
3. Token sent to server with login credentials
4. Server verifies token with Cloudflare
5. Login proceeds if verification passes

## Setup Instructions

### Step 1: Get Turnstile Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sign in or create a free account
3. Navigate to Turnstile section
4. Click "Add Site"
5. Configure your site:
   - **Site Name**: Your application name (e.g., "4diary")
   - **Domain**: Your domain (or `localhost` for development)
   - **Widget Mode**: Managed (recommended) or Non-Interactive
6. Click "Create"
7. Copy your **Site Key** and **Secret Key**

### Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Cloudflare Turnstile (Optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key-here
TURNSTILE_SECRET_KEY=your-secret-key-here
```

**Important**: 
- The site key starts with `NEXT_PUBLIC_` because it's used in client-side code
- Keep the secret key secure and never expose it to the client

### Step 3: Restart Application

```bash
# If using Docker
docker-compose restart

# If running locally
npm run dev
```

### Step 4: Test

1. Navigate to the login page (`/auth`)
2. You should see the Turnstile widget (usually a checkbox or invisible)
3. Attempt to log in
4. Verify the login works with Turnstile verification

## Configuration Options

### Widget Appearance

Turnstile supports different modes in the Cloudflare dashboard:

#### Managed (Recommended)
- Automatically determines challenge level
- Shows challenge only when needed
- Best balance of security and user experience

#### Non-Interactive
- Invisible challenge
- No user interaction required
- Best for seamless experience

#### Invisible
- Completely invisible
- Challenge runs in background
- May request interaction if suspicious

### Development vs Production

#### Development Setup
```bash
# Use localhost domain in Cloudflare dashboard
Domain: localhost

# Local .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-dev-site-key
TURNSTILE_SECRET_KEY=your-dev-secret-key
```

#### Production Setup
```bash
# Use actual domain in Cloudflare dashboard
Domain: yourdomain.com

# Production environment variables
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-prod-site-key
TURNSTILE_SECRET_KEY=your-prod-secret-key
```

## Disabling Turnstile

To disable Turnstile:

### Option 1: Remove Environment Variables
Simply remove or comment out the Turnstile variables:

```bash
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key-here
# TURNSTILE_SECRET_KEY=your-secret-key-here
```

### Option 2: Delete from .env.local
Delete the Turnstile lines from your `.env.local` file

### Option 3: Leave Empty
Set the variables to empty strings:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

After any of these changes, restart your application.

## Troubleshooting

### Turnstile Widget Not Appearing

**Check Environment Variables**
```bash
# Verify site key is set correctly
echo $NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Make sure it starts with NEXT_PUBLIC_
```

**Restart Required**
- After adding environment variables, restart the app
- Clear browser cache if needed

**Check Browser Console**
- Open browser developer tools
- Look for Turnstile-related errors
- Verify site key is correct

### "Bot Verification Failed" Error

**Invalid Site Key**
- Verify site key matches Cloudflare dashboard
- Check for typos or extra spaces
- Ensure domain matches configuration

**Invalid Secret Key**
- Verify secret key on server matches Cloudflare
- Check environment variable is set correctly
- Restart server after changing

**Network Issues**
- Check if Cloudflare Turnstile endpoint is accessible
- Verify no firewall blocking Cloudflare domains
- Try again after a moment

### Login Works But Turnstile Missing

**Expected Behavior**
- If Turnstile keys not configured, login works normally
- This is by design for self-hostability
- No error messages shown to user

**To Enable**
- Add environment variables
- Restart application
- Refresh browser

### Turnstile Blocking Legitimate Users

**Adjust Widget Mode**
- Switch to "Managed" mode for better experience
- Consider "Non-Interactive" for minimal friction
- Check Cloudflare dashboard for false positive rates

**Whitelist IP Addresses**
- In Cloudflare dashboard, add trusted IPs to allowlist
- Useful for known users or internal networks

**Review Turnstile Settings**
- Lower security level if too strict
- Check analytics for challenge success rates

## Best Practices

### For Self-Hosters

1. **Test Without First**: Verify login works without Turnstile
2. **Start with Free Tier**: Use Cloudflare free tier initially
3. **Monitor Usage**: Check Turnstile analytics in Cloudflare dashboard
4. **Document Setup**: Keep setup instructions for your deployment
5. **Backup Keys**: Store keys securely (password manager)

### For Production Deployments

1. **Use Separate Keys**: Different keys for dev and production
2. **Secure Secret Key**: Never commit secret key to version control
3. **Monitor Performance**: Watch for impact on login speed
4. **Have Fallback**: Ensure login works if Turnstile service down
5. **Test Regularly**: Verify Turnstile still working after updates

### For Users

1. **Clear Communication**: Inform users about bot protection
2. **Support Alternative**: Provide way to contact if Turnstile blocks
3. **Privacy Notice**: Mention Cloudflare Turnstile in privacy policy
4. **Disable If Needed**: Can disable if causing too many issues

## Privacy Considerations

### What Turnstile Collects
- Browser information (user agent, etc.)
- Challenge interaction data
- Timestamp of verification
- IP address (temporary)

### What Turnstile Doesn't Collect
- Personal identification information
- Login credentials
- Document content
- User behavior beyond challenge

### Privacy Comparison
Compared to traditional CAPTCHAs:
- **More Private**: Less tracking than reCAPTCHA
- **Faster**: Lightweight verification
- **User-Friendly**: Often invisible to users
- **No Google**: Independent of Google services

## Alternative Solutions

If Cloudflare Turnstile doesn't fit your needs:

### Built-In Protection
- Rate limiting (already included)
- Account lockout after failed attempts
- Session management

### Other Options
- hCaptcha (privacy-focused alternative)
- Friendly Captcha (EU-hosted)
- Custom implementation
- IP-based rate limiting

## Cost

### Cloudflare Turnstile Pricing
- **Free Tier**: 1 million requests/month
- **Paid Plans**: Available for higher volumes
- **For Most Users**: Free tier is sufficient

### When to Upgrade
- High traffic websites
- Enterprise deployments
- Need advanced features
- Require SLA guarantees

## FAQ

**Q: Is Turnstile required?**
A: No, 4diary works perfectly without it. It's completely optional.

**Q: Does Turnstile work with self-hosted instances?**
A: Yes, full support for self-hosted deployments.

**Q: Can I use other CAPTCHA services?**
A: Currently only Turnstile is supported, but code can be modified for alternatives.

**Q: What happens if Cloudflare is down?**
A: The code includes graceful degradation - login continues if verification fails.

**Q: Is my data sent to Cloudflare?**
A: Only challenge verification data, never your login credentials or documents.

**Q: Can I disable it later?**
A: Yes, simply remove the environment variables and restart.

---

**Remember**: Bot protection is one layer of security. Always use strong passwords, enable 2FA when available, and follow security best practices for your deployment.
