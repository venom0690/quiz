import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/submissions — returns all teams and their submissions
export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("team_name")
    .order("question_number")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform flat data into grouped format by team name
  const grouped: Record<string, Array<{
    questionNumber: number
    answer: string | null
    timeTaken: number | null
    submittedAt: string
  }>> = {}

  for (const row of data) {
    if (!grouped[row.team_name]) {
      grouped[row.team_name] = []
    }
    grouped[row.team_name].push({
      questionNumber: row.question_number,
      answer: row.answer,
      timeTaken: row.time_taken,
      submittedAt: row.submitted_at,
    })
  }

  return NextResponse.json(grouped)
}

// POST /api/submissions — saves a submission for a team
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { teamName, questionNumber, answer, timeTaken, submittedAt } = body

  if (!teamName || !questionNumber) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const supabase = await createClient()

  // Upsert: insert or update if team+question already exists
  const { error } = await supabase
    .from("submissions")
    .upsert(
      {
        team_name: teamName,
        question_number: questionNumber,
        answer,
        time_taken: timeTaken,
        submitted_at: submittedAt || new Date().toISOString(),
      },
      {
        onConflict: "team_name,question_number",
      }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/submissions?team=TeamName — clears a team's data
export async function DELETE(req: NextRequest) {
  const team = req.nextUrl.searchParams.get("team")
  const supabase = await createClient()

  if (team) {
    const { error } = await supabase
      .from("submissions")
      .delete()
      .eq("team_name", team)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Delete all submissions - use gte on created_at to match all rows
    const { error } = await supabase
      .from("submissions")
      .delete()
      .gte("created_at", "1970-01-01")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
