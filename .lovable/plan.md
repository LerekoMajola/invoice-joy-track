

## Update Africa's Talking Credentials

### What will happen
Both the API Key and Username for your SMS provider will be updated with fresh values you provide.

### Steps
1. You'll be prompted to enter your new **AT_API_KEY** (from your Africa's Talking dashboard under Settings)
2. You'll be prompted to enter your new **AT_USERNAME** (your Africa's Talking app/account name)
3. The SMS backend function will be redeployed to pick up the new credentials
4. A test SMS will be triggered to verify everything works

### Where to find your credentials
- Log in at [account.africastalking.com](https://account.africastalking.com/)
- **Username**: Shown at the top of your dashboard (your app name)
- **API Key**: Go to **Settings** and generate/copy your API key

### Technical details
- Secrets to update: `AT_API_KEY`, `AT_USERNAME`
- Edge function to redeploy: `send-sms`
- Test call to `/send-sms` to confirm authentication passes

