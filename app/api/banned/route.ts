import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "banned.json")

function readData(): string[] {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify([]))
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
}

function writeData(data: string[]) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function GET() {
  return NextResponse.json(readData())
}

export async function POST(req: NextRequest) {
  const { teamName } = await req.json()
  if (!teamName) return NextResponse.json({ error: "Missing teamName" }, { status: 400 })
  const data = readData()
  if (!data.includes(teamName)) {
    data.push(teamName)
    writeData(data)
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const team = req.nextUrl.searchParams.get("team")
  const data = readData()
  const updated = team ? data.filter((t) => t !== team) : []
  writeData(updated)
  return NextResponse.json({ success: true })
}
