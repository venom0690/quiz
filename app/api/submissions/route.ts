import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "submissions.json")

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify({}))
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
}

function writeData(data: object) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// GET /api/submissions — returns all teams and their submissions
export async function GET() {
  const data = readData()
  return NextResponse.json(data)
}

// POST /api/submissions — saves a submission for a team
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { teamName, questionNumber, answer, timeTaken, submittedAt } = body

  if (!teamName || !questionNumber) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const data = readData()
  if (!data[teamName]) data[teamName] = []

  // replace if already exists for this question
  data[teamName] = data[teamName].filter(
    (s: { questionNumber: number }) => s.questionNumber !== questionNumber
  )
  data[teamName].push({ questionNumber, answer, timeTaken, submittedAt })

  writeData(data)
  return NextResponse.json({ success: true })
}

// DELETE /api/submissions?team=TeamName — clears a team's data
export async function DELETE(req: NextRequest) {
  const team = req.nextUrl.searchParams.get("team")
  const data = readData()
  if (team) {
    delete data[team]
  } else {
    Object.keys(data).forEach((k) => delete data[k])
  }
  writeData(data)
  return NextResponse.json({ success: true })
}
