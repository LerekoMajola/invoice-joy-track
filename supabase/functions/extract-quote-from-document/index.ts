import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing document text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
              content:
                "You are a document parser that extracts quote/invoice data from documents. Extract all relevant fields using the provided tool. If a field is not found, leave it as an empty string or empty array. For line items, extract as many as you can find — look for tables, lists, or itemised sections with descriptions and amounts.",
            },
            {
              role: "user",
              content: `Extract quote information from this document:\n\n${text.slice(0, 15000)}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_quote_data",
                description:
                  "Extract structured quote data from the document text",
                parameters: {
                  type: "object",
                  properties: {
                    clientName: {
                      type: "string",
                      description: "Client or company name",
                    },
                    description: {
                      type: "string",
                      description: "Project or work description",
                    },
                    leadTime: {
                      type: "string",
                      description:
                        "Delivery or turnaround time if mentioned",
                    },
                    notes: {
                      type: "string",
                      description: "Additional notes or special conditions",
                    },
                    lineItems: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          description: { type: "string" },
                          quantity: { type: "number" },
                          unitPrice: { type: "number" },
                          costPrice: { type: "number" },
                        },
                        required: ["description", "quantity", "unitPrice"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: [
                    "clientName",
                    "description",
                    "leadTime",
                    "notes",
                    "lineItems",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_quote_data" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured output returned from AI");
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-quote-from-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
