// This was a debugging endpoint. It is gone: delete the whole `app/api/ai-test`
// folder. Until then it just answers "not found".
export function GET() {
  return new Response(null, { status: 404 });
}
