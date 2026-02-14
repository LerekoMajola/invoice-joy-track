

## Fix SMS Delivery: Handle API Errors + Verify Credentials

### Problem

The `send-sms` edge function crashes at line 79 because Africa's Talking returns a plain-text error (not JSON). The response starts with "The suppli..." which strongly indicates **"The supplied API key is invalid"**.

### Two Issues to Fix

**1. Invalid API Key (requires your action)**

Your Africa's Talking API key appears to be invalid or expired. You need to:
- Log in to your [Africa's Talking dashboard](https://account.africastalking.com/)
- Go to Settings and copy your current API key
- Confirm whether you're using the **sandbox** or **live** environment
  - Sandbox uses: `https://api.sandbox.africastalking.com/version1/messaging`
  - Live uses: `https://api.africastalking.com/version1/messaging`
- If the key has changed, we'll update it

**2. Code fix: Handle non-JSON API responses (code change)**

Update `supabase/functions/send-sms/index.ts` to safely handle text error responses from Africa's Talking instead of crashing:

```typescript
// Before parsing as JSON, check if response is OK
const atResponseText = await atResponse.text();
let atResult;
try {
  atResult = JSON.parse(atResponseText);
} catch {
  // API returned non-JSON (e.g., "The supplied API key is invalid")
  console.error("AT API non-JSON response:", atResponse.status, atResponseText);
  
  await supabaseAdmin.from("sms_log").insert({
    user_id, phone_number: phone, message,
    status: "failed", notification_id,
  });
  
  return new Response(
    JSON.stringify({ error: "SMS provider error", details: atResponseText }),
    { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

This ensures:
- The exact error from Africa's Talking is logged (so we can see what's wrong)
- The function no longer crashes on text responses
- Failed attempts are recorded in `sms_log`

### Files to modify

| File | Change |
|------|--------|
| `supabase/functions/send-sms/index.ts` | Safe JSON parsing + error logging |

### After the code fix

Once deployed, we can trigger a test notification. The logs will show the exact error message from Africa's Talking, confirming whether the API key needs to be updated.

