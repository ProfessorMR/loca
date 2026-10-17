/**
 * Keeps the AI bill under control.
 *
 * Every NEW search sentence calls a paid model, so each visitor gets a small
 * allowance and the whole site has a daily cap. Past a limit the search still
 * works, using the simple built-in understanding instead of the AI. Answers
 * that were already asked before come from a cache and cost nothing.
 *
 * The counters live in memory, so on a host that runs several copies of the
 * server (like Vercel) each copy counts for itself. That is a good safety net
 * for an MVP; use a shared store (Upstash Redis) when real traffic arrives.
 */

type Rule = { limit: number; windowMs: number };

export type Limiter = {
  /** Records a call and returns true if it is allowed. */
  allow(key: string, now?: number): boolean;
};

const MAX_KEYS = 10_000;

export function createLimiter(rules: Rule[]): Limiter {
  const longest = Math.max(...rules.map((rule) => rule.windowMs));
  const calls = new Map<string, number[]>();

  return {
    allow(key, now = Date.now()) {
      const recent = (calls.get(key) ?? []).filter(
        (time) => now - time < longest,
      );

      const allowed = rules.every(
        (rule) =>
          recent.filter((time) => now - time < rule.windowMs).length <
          rule.limit,
      );

      if (allowed) recent.push(now);

      if (recent.length > 0) calls.set(key, recent);
      else calls.delete(key);

      // Forget visitors who went away.
      if (calls.size > MAX_KEYS) {
        for (const [otherKey, times] of calls) {
          if (now - times[times.length - 1] >= longest) calls.delete(otherKey);
        }
      }

      return allowed;
    },
  };
}

export class AiLimitError extends Error {
  constructor() {
    super("AI search limit reached");
    this.name = "AiLimitError";
  }
}

const dailyLimit = Number.parseInt(process.env.AI_DAILY_LIMIT ?? "", 10);

const perVisitor = createLimiter([
  { limit: 8, windowMs: 60_000 },
  { limit: 60, windowMs: 3_600_000 },
]);

const wholeSite = createLimiter([
  {
    limit: Number.isFinite(dailyLimit) && dailyLimit > 0 ? dailyLimit : 1000,
    windowMs: 86_400_000,
  },
]);

/** True if one more model call is allowed for this visitor. */
export function allowAiCall(clientKey: string | undefined): boolean {
  return perVisitor.allow(clientKey ?? "unknown") && wholeSite.allow("site");
}
