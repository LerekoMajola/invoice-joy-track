

## Fix: Re-enter AT_API_KEY and Force Redeploy

### Root Cause
The `AT_API_KEY` secret still contains the old 77-character key (prefix `atsk`). Previous secret update attempts did not successfully replace the value. The `send-sms` function continues to authenticate with the old (invalid) key.

### Steps

1. **Re-enter AT_API_KEY secret** - Use the secret update tool one more time with a freshly generated key from the Africa's Talking Live dashboard
   - Go to your Africa's Talking dashboard (Live mode, app "OrionLabs")
   - Navigate to Settings and generate a brand new API key
   - Wait 2-3 minutes after generating before entering it (AT keys need propagation time)
   - Copy the full key carefully - no extra spaces

2. **Add temporary debug logging** to `send-sms/index.ts` to confirm the new key length after the update:
   ```
   console.log("KEY_CHECK length:", atApiKey?.length);
   ```

3. **Force redeploy** the `send-sms` edge function to pick up the new secret value

4. **Wait 30 seconds**, then test with a real SMS to your phone number `+26658335233`

5. **Remove debug logging** once verified working

### Important Notes
- Africa's Talking documentation confirms that newly generated API keys may take a few minutes to propagate
- Generate the key, wait 2-3 minutes, THEN enter it in the secret field
- The key format `atsk...` (77+ chars) IS the correct format for AT API keys
- Make sure you are generating from the Live app "OrionLabs", not Sandbox

### Technical Details
- File to modify: `supabase/functions/send-sms/index.ts` (temporary debug log)
- Secret to update: `AT_API_KEY`
- Function to redeploy: `send-sms`
- Test endpoint: POST `/send-sms` with user_id `0ad03a1e-8e32-4f04-88ee-f3c4fde1a25d`

