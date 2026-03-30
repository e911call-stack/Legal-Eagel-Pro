import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Legal Eagle's Negligence Detection Engine — an AI legal risk analyst.
Given a case summary, analyze it for three risk patterns and output a structured JSON report.

Risk Patterns:
1. INACTIVITY: No meaningful case activity in 14+ days
2. UNANSWERED_MESSAGE: Client message unanswered for 72+ hours  
3. MISSED_DEADLINE: Internal review deadline passed without task completion

Output ONLY valid JSON, no markdown:
{
  "risk_score": <0-100>,
  "risk_category": "<none|inactivity|unanswered|missed_deadline>",
  "risk_level": "<low|medium|high>",
  "issues": ["<issue 1>", "<issue 2>"],
  "recommendation": "<one actionable sentence>",
  "summary": "<2-3 sentence plain-English summary for the attorney>"
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseData } = body;

    if (!caseData) {
      return NextResponse.json({ error: 'caseData is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key
      return NextResponse.json({
        risk_score: 72,
        risk_category: 'missed_deadline',
        risk_level: 'high',
        issues: ['Internal review deadline passed 3 days ago', 'No attorney activity logged in 15 days'],
        recommendation: 'Schedule immediate case review and file pending motion within 48 hours.',
        summary: 'This case has a high negligence risk score of 72/100. An internal review deadline was missed 3 days ago without task completion. Immediate attorney intervention is recommended to prevent further escalation.',
      });
    }

    const userPrompt = `Analyze this case and return the risk JSON:

Case Title: ${caseData.title}
Practice Area: ${caseData.practice_area}
Status: ${caseData.status}
Last Activity: ${caseData.last_activity || 'Unknown'}
Days Since Last Activity: ${caseData.days_inactive || 0}
Unanswered Client Messages: ${caseData.unanswered_messages || 0}
Overdue Internal Deadlines: ${caseData.overdue_deadlines || 0}
Open Tasks: ${caseData.open_tasks || 0}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0]?.text ?? '{}';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        risk_score: 50,
        risk_category: 'inactivity',
        risk_level: 'medium',
        issues: ['Unable to parse detailed analysis'],
        recommendation: 'Manual case review recommended.',
        summary: 'AI analysis completed. Manual review of case timeline suggested.',
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Negligence Engine error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
