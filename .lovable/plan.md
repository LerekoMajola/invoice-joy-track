

## Fix Africa's Talking SMS Authentication

### Problem
The `AT_API_KEY` and `AT_USERNAME` secrets are still returning a 401 "authentication is invalid" error from Africa's Talking. The credentials need to be re-entered with correct values.

### Steps
1. **Re-enter both secrets** (`AT_API_KEY` and `AT_USERNAME`) with freshly copied values from the Africa's Talking dashboard
2. **Redeploy** the `send-sms` backend function to pick up the new values
3. **Test** the SMS delivery with a real phone number

### How to get correct credentials
1. Log in to [account.africastalking.com](https://account.africastalking.com/)
2. Make sure you are in the **Live** environment (not Sandbox)
3. Your **Username** is shown at the top -- copy it exactly (case-sensitive)
4. Go to **Settings** and generate/copy a fresh **API Key**

### Tips to avoid errors
- No leading or trailing spaces when pasting
- Username is case-sensitive
- API Key should be the full string (typically 64 characters)
- Make sure you're copying from the Live app, not Sandbox

### Technical details
- Secrets to update: `AT_API_KEY`, `AT_USERNAME`
- Edge function to redeploy: `send-sms`
- Verification: POST test to `/send-sms` endpoint

