

## AI Workout Plan Generator

An AI-powered feature that generates personalized workout sessions for gym members based on their fitness goals, body stats, and training history -- accessible from the Progress tab.

### How It Works

1. **Member sets their fitness goal** (one-time, changeable anytime): Weight Loss, Muscle Gain, General Fitness, Strength, Endurance, or Flexibility
2. **AI generates a workout plan** using the member's vitals data (weight, body fat %, muscle mass) + goal + available equipment context
3. **Member sees today's workout** as a clean, swipeable exercise list with sets, reps, and rest times
4. **Can regenerate** if they want variety or a different focus

### What Members See

On the Progress tab, below the existing stats and charts, a new "Today's Workout" section appears:

- **Goal selector** -- a row of pill buttons (Weight Loss, Muscle Gain, General Fitness, etc.) saved to their profile
- **Workout card** -- AI-generated workout with:
  - Workout title (e.g., "Upper Body Power")
  - Estimated duration
  - List of exercises with sets x reps, rest periods
  - Difficulty badge (Beginner / Intermediate / Advanced)
- **"Generate New Workout" button** -- calls AI for a fresh plan
- Workouts are cached per day so regenerating is optional, not required

### Database Changes

**Add `fitness_goal` column to `gym_members` table:**
- `fitness_goal` (text, nullable) -- stores the member's selected goal

**New table: `gym_workout_plans`**
- `id` (uuid, PK)
- `member_id` (FK to gym_members)
- `generated_at` (timestamp)
- `goal` (text -- the goal used to generate)
- `title` (text)
- `duration_minutes` (integer)
- `difficulty` (text)
- `exercises` (jsonb -- array of exercise objects)
- `vitals_snapshot` (jsonb -- weight/bf%/muscle at time of generation)

RLS: Members can read their own plans. Insert via edge function (service role).

### Edge Function: `generate-workout`

- Receives: `member_id`, `goal`, latest vitals
- Uses Lovable AI (gemini-3-flash-preview) with a fitness-focused system prompt
- Uses tool calling to extract structured workout data (title, exercises array, duration, difficulty)
- Saves the result to `gym_workout_plans`
- Returns the plan to the client

### Navigation

No nav changes needed -- the workout section lives inside the existing Progress tab, below the body stats and charts. This keeps the tab as the "training hub."

### File Changes

| File | Change |
|------|--------|
| **Migration** | Add `fitness_goal` to `gym_members`, create `gym_workout_plans` table with RLS |
| `supabase/functions/generate-workout/index.ts` | **New** -- edge function that calls Lovable AI to generate structured workout plans |
| `src/components/portal/gym/GymPortalProgress.tsx` | Add goal selector pills and "Today's Workout" card section below existing stats |

### Technical Details

**AI prompt structure:**
- System: "You are a certified personal trainer. Generate a workout session based on the member's goal and body stats."
- User: Includes goal, weight, body fat %, muscle mass, gender, age (from date_of_birth)
- Tool calling extracts structured JSON: `{ title, duration_minutes, difficulty, exercises: [{ name, sets, reps, rest_seconds, notes }] }`

**Caching strategy:**
- Query for existing plan from today before calling AI
- Only call AI if no plan exists for today or member taps "Generate New"
- Plans are lightweight (single JSONB column for exercises)

**Goal selector:**
- Saves to `gym_members.fitness_goal` via direct update
- Persists across sessions so member doesn't re-select every time
- Changing goal triggers a new plan generation

