import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEARCH_QUERIES = [
  "tenders Lesotho 2026",
  "RFQ Lesotho government procurement",
  "Lesotho tender notice bid invitation",
  "Maseru procurement tender",
  "Lesotho procurement notice 2026",
  "Lesotho government RFP request for proposal",
  "Lesotho construction tender bid",
  "UNDP Lesotho procurement",
  "Lesotho consulting services EOI",
  "Lesotho supply delivery tender",
];

const KNOWN_SOURCES = [
  { url: "https://www.gov.ls/tenders/", name: "Government of Lesotho" },
  { url: "https://lesothotenders.com", name: "Lesotho Tenders" },
  { url: "https://www.undp.org/lesotho/procurement", name: "UNDP Lesotho" },
  { url: "https://procurement.gov.ls", name: "Government Procurement Portal" },
  { url: "https://reliefweb.int/country/lso", name: "ReliefWeb Lesotho" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { company_profile_id } = await req.json().catch(() => ({}));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting tender scraping with Jina AI...");

    let allContent: { markdown: string; url: string; title: string }[] = [];

    // 1. Search via Jina AI Search (s.jina.ai)
    for (const query of SEARCH_QUERIES) {
      try {
        console.log(`Searching: ${query}`);
        const searchRes = await fetch(
          `https://s.jina.ai/${encodeURIComponent(query)}`,
          { headers: { "Accept": "text/markdown" } }
        );

        if (searchRes.ok) {
          const markdown = await searchRes.text();
          if (markdown && markdown.length > 100) {
            allContent.push({
              markdown: markdown.substring(0, 5000),
              url: `https://s.jina.ai/${encodeURIComponent(query)}`,
              title: `Search: ${query}`,
            });
          }
        }
      } catch (e) {
        console.error(`Jina search failed for "${query}":`, e);
      }
    }

    // 2. Scrape known sources via Jina AI Reader (r.jina.ai)
    for (const source of KNOWN_SOURCES) {
      try {
        console.log(`Scraping: ${source.url}`);
        const scrapeRes = await fetch(
          `https://r.jina.ai/${source.url}`,
          { headers: { "Accept": "text/markdown" } }
        );

        if (scrapeRes.ok) {
          const markdown = await scrapeRes.text();
          if (markdown && markdown.length > 100) {
            allContent.push({
              markdown: markdown.substring(0, 5000),
              url: source.url,
              title: source.name,
            });
          }
        }
      } catch (e) {
        console.error(`Jina reader failed for ${source.url}:`, e);
      }
    }

    if (allContent.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: "No content found from sources" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Send to AI for structured extraction
    const combinedContent = allContent
      .map((c, i) => `--- SOURCE ${i + 1}: ${c.url} ---\nTitle: ${c.title}\n${c.markdown}`)
      .join("\n\n");

    console.log(`Sending ${allContent.length} sources to AI for parsing...`);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a tender extraction assistant. Extract all tenders, RFQs, bids, and procurement notices from the provided web content. Return a JSON array of objects with these fields:
- title (string, required): the tender/RFQ title
- organization (string): the issuing organization/body
- description (string): brief summary of what's being procured
- closing_date (string): deadline/closing date as written
- reference_number (string or null): tender reference number if available
- source_url (string): the URL where this was found
- source_name (string): name of the website/source
- estimated_value (string or null): estimated value if mentioned
- category (string or null): category like "construction", "IT", "consulting", "supplies", "services", etc.

Only include actual tenders/RFQs/procurement notices. Skip news articles, general pages, or irrelevant content.
Return ONLY the JSON array, no markdown fencing or explanation.`,
          },
          {
            role: "user",
            content: combinedContent.substring(0, 30000),
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_tenders",
              description: "Extract structured tender data from web content",
              parameters: {
                type: "object",
                properties: {
                  tenders: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        organization: { type: "string" },
                        description: { type: "string" },
                        closing_date: { type: "string" },
                        reference_number: { type: "string" },
                        source_url: { type: "string" },
                        source_name: { type: "string" },
                        estimated_value: { type: "string" },
                        category: { type: "string" },
                      },
                      required: ["title"],
                    },
                  },
                },
                required: ["tenders"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_tenders" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      return new Response(
        JSON.stringify({ error: "AI parsing failed", details: errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiRes.json();
    let tenders: any[] = [];

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        tenders = parsed.tenders || [];
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`AI extracted ${tenders.length} tenders`);

    // 4. Deduplicate and insert
    let insertedCount = 0;
    for (const tender of tenders) {
      if (!tender.title) continue;

      const { data: existing } = await supabase
        .from("scraped_tenders")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", tender.title)
        .eq("organization", tender.organization || "")
        .maybeSingle();

      if (existing) {
        console.log(`Skipping duplicate: ${tender.title}`);
        continue;
      }

      const { error: insertError } = await supabase.from("scraped_tenders").insert({
        user_id: user.id,
        company_profile_id: company_profile_id || null,
        title: tender.title,
        organization: tender.organization || "",
        description: tender.description || "",
        closing_date: tender.closing_date || null,
        reference_number: tender.reference_number || null,
        source_url: tender.source_url || "",
        source_name: tender.source_name || "",
        estimated_value: tender.estimated_value || null,
        category: tender.category || null,
        raw_content: null,
      });

      if (insertError) {
        console.error(`Insert error for "${tender.title}":`, insertError);
      } else {
        insertedCount++;
      }
    }

    console.log(`Inserted ${insertedCount} new tenders`);

    return new Response(
      JSON.stringify({
        success: true,
        count: insertedCount,
        total_found: tenders.length,
        sources_scraped: allContent.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("scrape-tenders error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
