import type { DtcCode, Vehicle } from '../store';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DiagnosisResult {
  explanation: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  possibleCauses: string[];
  recommendedActions: string[];
  estimatedCostRange?: string;
  canDriveSafely: boolean;
}

function buildSystemPrompt(vehicle: Vehicle | null): string {
  const vehicleInfo = vehicle
    ? `The user's vehicle is a ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
    : 'The vehicle make/model is unknown.';

  return `You are MechAI, an expert automotive diagnostic assistant. ${vehicleInfo}

Your job is to help car owners understand their OBD2 diagnostic trouble codes (DTCs) in plain English. Be clear, helpful, and avoid unnecessary jargon. Always prioritize safety.

When explaining a DTC:
1. Say what's wrong in simple terms
2. Explain how urgent it is
3. List the most likely causes
4. Recommend next steps
5. Give a rough repair cost range (US dollars)
6. Tell them if it's safe to keep driving

Respond in JSON format with this exact structure:
{
  "explanation": "...",
  "urgency": "low|medium|high|critical",
  "possibleCauses": ["...", "..."],
  "recommendedActions": ["...", "..."],
  "estimatedCostRange": "$X - $Y",
  "canDriveSafely": true|false
}`;
}

export async function diagnoseDTC(
  dtcCode: DtcCode,
  vehicle: Vehicle | null,
  conversationHistory: AIMessage[] = []
): Promise<DiagnosisResult> {
  if (!API_KEY) {
    throw new Error('Anthropic API key not configured. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file.');
  }

  const userMessage = `Please diagnose this fault code:
Code: ${dtcCode.code}
Description: ${dtcCode.description}
System: ${dtcCode.system}`;

  const messages: AIMessage[] = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: buildSystemPrompt(vehicle),
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text ?? '';

  try {
    return JSON.parse(content) as DiagnosisResult;
  } catch {
    // Fallback if JSON parsing fails
    return {
      explanation: content,
      urgency: dtcCode.severity,
      possibleCauses: [],
      recommendedActions: ['Take your vehicle to a qualified mechanic for diagnosis'],
      canDriveSafely: dtcCode.severity !== 'critical',
    };
  }
}

export async function chatWithMechAI(
  message: string,
  vehicle: Vehicle | null,
  history: AIMessage[]
): Promise<string> {
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: buildSystemPrompt(vehicle),
      messages: [...history, { role: 'user', content: message }],
    }),
  });

  if (!response.ok) throw new Error('AI request failed');

  const data = await response.json();
  return data.content[0]?.text ?? 'No response from AI';
}
