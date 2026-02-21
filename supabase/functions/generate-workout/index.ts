import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { member_id, goal, vitals, gender, date_of_birth } = await req.json();
    if (!member_id || !goal) {
      return new Response(JSON.stringify({ error: "member_id and goal are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Build user context
    const age = date_of_birth
      ? Math.floor((Date.now() - new Date(date_of_birth).getTime()) / 31557600000)
      : null;

    const statsLines = [
      `Goal: ${goal}`,
      vitals?.weight_kg ? `Weight: ${vitals.weight_kg} kg` : null,
      vitals?.body_fat_pct ? `Body fat: ${vitals.body_fat_pct}%` : null,
      vitals?.muscle_mass_kg ? `Muscle mass: ${vitals.muscle_mass_kg} kg` : null,
      gender ? `Gender: ${gender}` : null,
      age ? `Age: ${age}` : null,
    ].filter(Boolean).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a certified personal trainer. Generate a single workout session tailored to the member's fitness goal and body stats. The workout should be practical, safe, and achievable in a standard gym. Include a mix of compound and isolation exercises appropriate for the goal. Vary the workouts — don't always suggest the same exercises.",
          },
          {
            role: "user",
            content: `Generate today's workout for this member:\n${statsLines}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_workout_plan",
              description: "Return a structured workout plan",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Short workout title, e.g. 'Upper Body Power'" },
                  duration_minutes: { type: "integer", description: "Estimated duration in minutes" },
                  difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        sets: { type: "integer" },
                        reps: { type: "string", description: "e.g. '12' or '8-10' or '30 sec'" },
                        rest_seconds: { type: "integer" },
                        notes: { type: "string", description: "Optional form tips or alternatives" },
                      },
                      required: ["name", "sets", "reps", "rest_seconds"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "duration_minutes", "difficulty", "exercises"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_workout_plan" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Failed to generate workout" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "AI did not return a structured workout" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = JSON.parse(toolCall.function.arguments);

    // Save to database
    const { data: saved, error: dbError } = await supabase
      .from("gym_workout_plans")
      .insert({
        member_id,
        goal,
        title: plan.title,
        duration_minutes: plan.duration_minutes,
        difficulty: plan.difficulty,
        exercises: plan.exercises,
        vitals_snapshot: vitals || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Still return the plan even if save fails
      return new Response(JSON.stringify({ plan, saved: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ plan: saved, saved: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-workout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
