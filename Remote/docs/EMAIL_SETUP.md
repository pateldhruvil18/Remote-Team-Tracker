# 📧 Real Email Setup Instructions

Currently, the system is using **Ethereal Email** (test service) which only creates preview URLs but doesn't send real emails to your inbox.

To receive **real emails** in your email address, follow these steps:

## 🔧 Step 1: Get Gmail App Password

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Enable 2-Factor Authentication** (if not already enabled)
3. **Generate App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

## 🔧 Step 2: Configure Environment Variables

Edit the file `backend/.env` and uncomment/update these lines:

```env
# Email Configuration (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-character-app-password
FROM_EMAIL=your-email@gmail.com
```

**Example:**
```env
# Email Configuration (Gmail SMTP)
GMAIL_USER=john.doe@gmail.com
GMAIL_PASS=abcd efgh ijkl mnop
FROM_EMAIL=john.doe@gmail.com
```

## 🔧 Step 3: Restart the Server

After updating the `.env` file:

1. Stop the current server (Ctrl+C)
2. Restart: `node server.js`
3. You should see: `📧 Email service configured with Gmail SMTP`

## 🔧 Step 4: Test Real Email Sending

1. **Login as Manager**: `manager@example.com` / `Password123`
2. **Click "📨 Invite User"**
3. **Enter your email address** in the invitation form
4. **Click "Send Invitation"**
5. **Check your email inbox** - you should receive a real email!

## 🔧 Alternative: Quick Setup Script

Run this command in the backend directory:

```bash
node setup-email.js
```

This will guide you through the setup process.

## ⚠️ Important Notes

- **Use App Password**: Don't use your regular Gmail password
- **Keep Credentials Safe**: Never commit the `.env` file to version control
- **Test First**: Send a test invitation to yourself to verify it works

## 🎯 What Emails You'll Receive

Once configured, you'll receive real emails for:

- ✅ **User Invitations**: When managers invite new users
- ✅ **Welcome Emails**: When new users register
- ✅ **Team Announcements**: Manager-to-team communications
- ✅ **Individual Messages**: Personal manager messages
- ✅ **Meeting Invitations**: Team meeting invites
- ✅ **Productivity Reports**: Performance summaries
- ✅ **Low Productivity Alerts**: Supportive check-ins

## 🔍 Troubleshooting

**If emails still don't arrive:**

1. **Check Spam Folder**: Gmail might filter them
2. **Verify App Password**: Make sure it's correct (16 characters)
3. **Check Server Logs**: Look for error messages
4. **Test Gmail Settings**: Try sending a test email

**Server Log Messages:**
- ✅ `📧 Email service configured with Gmail SMTP` = Real emails enabled
- ⚠️ `📧 Email service configured with test account (Ethereal)` = Test mode only

## 🚀 Ready to Test!

Once you've completed the setup:

1. **Restart the server**
2. **Login as manager**
3. **Send yourself an invitation**
4. **Check your email inbox**
5. **Enjoy real email functionality!**

---

**Need help?** The system will automatically fall back to test mode if Gmail credentials aren't configured, so you can always see email previews in the console even without real email setup.
