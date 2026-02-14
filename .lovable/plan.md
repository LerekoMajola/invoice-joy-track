

## Fix: SMS 401 Error - Key Truncation Workaround

### Root Cause Identified
Your Africa's Talking account is confirmed working (the screenshot shows a successful SMS). The problem is that the API key stored in the backend secret is consistently **77 characters** instead of the expected **81 characters**. The secret storage appears to be truncating the key value, causing authentication to fail.

### Solution
Instead of relying on a single secret for the full key, we will split the API key across two secrets to avoid truncation, then concatenate them in the edge function code.

### Steps

1. **Split the API key into two parts and store as separate secrets**
   - `AT_API_KEY_1` = first 40 characters of your key
   - `AT_API_KEY_2` = remaining characters of your key

2. **Update `send-sms/index.ts`** to concatenate the two parts at runtime:
   - Replace `Deno.env.get("AT_API_KEY")` with `Deno.env.get("AT_API_KEY_1") + Deno.env.get("AT_API_KEY_2")`
   - Keep the debug log to verify the reconstructed key length is 81

3. **Update `send-sms-on-notification/index.ts`** if it also references AT_API_KEY directly (it calls send-sms via HTTP, so no change needed there)

4. **Redeploy and test** the send-sms function with a real SMS

5. **Clean up** debug logging once SMS sends successfully

### Technical Details

File to modify: `supabase/functions/send-sms/index.ts`

Change from:
```typescript
const atApiKey = Deno.env.get("AT_API_KEY")!;
```

Change to:
```typescript
const atApiKey = (Deno.env.get("AT_API_KEY_1") || "") + (Deno.env.get("AT_API_KEY_2") || "");
```

New secrets needed:
- `AT_API_KEY_1` - first 40 chars of the key
- `AT_API_KEY_2` - remaining 41 chars of the key

