import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  user_id: string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const vapidSubject = Deno.env.get('VAPID_SUBJECT')!;

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      throw new Error('VAPID keys not configured');
    }

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const callerUserId = claimsData.claims.sub;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: PushPayload = await req.json();
    const { user_id, title, body, url, icon } = payload;

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only allow sending notifications to yourself (or admin)
    if (callerUserId !== user_id) {
      // Check if caller is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', callerUserId)
        .eq('role', 'super_admin')
        .maybeSingle();
      
      if (!roleData) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: cannot send notifications to other users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch user's push subscription
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (fetchError) {
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No push subscription found for user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Helper functions
    const base64UrlEncode = (data: ArrayBuffer | Uint8Array): string => {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const base64UrlDecode = (str: string): Uint8Array => {
      const padding = '='.repeat((4 - (str.length % 4)) % 4);
      const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    };

    // Create VAPID JWT for authorization
    const createVapidJwt = async (audience: string): Promise<string> => {
      const encoder = new TextEncoder();
      
      const header = { typ: 'JWT', alg: 'ES256' };
      const now = Math.floor(Date.now() / 1000);
      const jwtPayload = {
        aud: audience,
        exp: now + 12 * 60 * 60,
        sub: vapidSubject,
      };

      const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
      const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(jwtPayload)));

      // Decode VAPID keys
      const publicKeyBytes = base64UrlDecode(vapidPublicKey);
      const privateKeyBytes = base64UrlDecode(vapidPrivateKey);

      // Create JWK for the private key
      const x = base64UrlEncode(publicKeyBytes.slice(1, 33));
      const y = base64UrlEncode(publicKeyBytes.slice(33, 65));
      const d = base64UrlEncode(privateKeyBytes);

      const jwk = { kty: 'EC', crv: 'P-256', x, y, d };

      const cryptoKey = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign']
      );

      const signatureInput = encoder.encode(`${headerB64}.${payloadB64}`);
      const signatureBuffer = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        cryptoKey,
        signatureInput
      );

      // Convert DER signature to raw format (64 bytes)
      const signature = new Uint8Array(signatureBuffer);
      let r: Uint8Array, s: Uint8Array;
      
      if (signature.length === 64) {
        r = signature.slice(0, 32);
        s = signature.slice(32, 64);
      } else {
        // Already in raw format
        r = signature.slice(0, 32);
        s = signature.slice(32);
      }
      
      const rawSignature = new Uint8Array(64);
      rawSignature.set(r.length <= 32 ? r : r.slice(-32), 32 - Math.min(r.length, 32));
      rawSignature.set(s.length <= 32 ? s : s.slice(-32), 64 - Math.min(s.length, 32));

      const signatureB64 = base64UrlEncode(rawSignature);
      return `${headerB64}.${payloadB64}.${signatureB64}`;
    };

    for (const subscription of subscriptions) {
      try {
        const notificationPayload = JSON.stringify({
          title,
          body,
          icon: icon || '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          data: { url: url || '/' },
        });

        const url_obj = new URL(subscription.endpoint);
        const audience = `${url_obj.protocol}//${url_obj.host}`;
        
        const jwt = await createVapidJwt(audience);
        
        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
            'Content-Type': 'text/plain',
            'TTL': '86400',
          },
          body: notificationPayload,
        });

        if (response.status === 410 || response.status === 404) {
          // Subscription expired or invalid, remove it
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id);
          results.push({ endpoint: subscription.endpoint, status: 'removed' });
        } else if (!response.ok) {
          const errorText = await response.text();
          console.error(`Push failed with status ${response.status}:`, errorText);
          results.push({ 
            endpoint: subscription.endpoint, 
            status: 'failed', 
            error: `HTTP ${response.status}` 
          });
        } else {
          results.push({ endpoint: subscription.endpoint, status: 'sent' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error sending to endpoint:', subscription.endpoint, error);
        results.push({ 
          endpoint: subscription.endpoint, 
          status: 'failed', 
          error: errorMessage 
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
