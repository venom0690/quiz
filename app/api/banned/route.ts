import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("banned_teams")
    .select("team_name")
    .order("created_at")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return just the array of team names for backward compatibility
  const teamNames = data.map((row) => row.team_name)
  return NextResponse.json(teamNames)
}

export async function POST(req: NextRequest) {
  const { teamName } = await req.json()
  
  if (!teamName) {
    return NextResponse.json({ error: "Missing teamName" }, { status: 400 })
  }

  const supabase = await createClient()

  // Upsert to handle duplicates gracefully
  const { error } = await supabase
    .from("banned_teams")
    .upsert(
      { team_name: teamName },
      { onConflict: "team_name" }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const team = req.nextUrl.searchParams.get("team")
  const supabase = await createClient()

  if (team) {
    const { error } = await supabase
      .from("banned_teams")
      .delete()
      .eq("team_name", team)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Delete all banned teams - use gte on created_at to match all rows
    const { error } = await supabase
      .from("banned_teams")
      .delete()
      .gte("created_at", "1970-01-01")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
