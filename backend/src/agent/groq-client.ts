/**
 * Groq AI Client
 *
 * Wraps groq-sdk with structured JSON output for Proto-Y agent reasoning.
 * NEVER logs GROQ_API_KEY. Uses process.env.GROQ_API_KEY only.
 *
 * Model selection:
 * - Intent extraction & Decision summary: openai/gpt-oss-20b (supports JSON mode, fast)
 * - Configurable via GROQ_MODEL env var
 */
import Groq from 'groq-sdk';
import { logAgent } from '../logger.js';

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable not set. Cannot use Groq AI agent.');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// Prefer env override, fall back to a compact model that supports JSON mode
const DEFAULT_JSON_MODEL = process.env.GROQ_JSON_MODEL || 'openai/gpt-oss-20b';
const DEFAULT_TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'openai/gpt-oss-20b';

export async function groqCompletion(
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_TEXT_MODEL,
  maxTokens: number = 1024
): Promise<string> {
  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: maxTokens,
    temperature: 0.1
  });

  const content = completion.choices[0]?.message?.content || '';
  logAgent(`Groq response received (${completion.usage?.total_tokens ?? 0} tokens, model: ${model})`);
  return content;
}

export async function groqJsonCompletion<T = any>(
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_JSON_MODEL,
  maxTokens: number = 600
): Promise<T> {
  const client = getGroqClient();

  // Try with json_object response format first
  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt + '\n\nALWAYS respond with valid JSON only. No markdown fences, no explanation.' },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    logAgent(`Groq JSON response (${completion.usage?.total_tokens ?? 0} tokens, model: ${model})`);
    return JSON.parse(content) as T;
  } catch (err: any) {
    // If json_object mode not supported, fall back to text with extraction
    if (err.status === 400 && err.message?.includes('response_format')) {
      logAgent(`JSON mode not supported by ${model}, falling back to text extraction`);
      const response = await groqCompletion(
        systemPrompt + '\n\nALWAYS respond with valid JSON only. No markdown fences.',
        userPrompt,
        model,
        maxTokens
      );
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
    }
    throw err;
  }
}

export function isGroqAvailable(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}
