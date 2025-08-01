import { get, set } from "netlify:kv";

// Configuration
const WINDOW_SECONDS = 60;        // window length in seconds
const IP_MAX_REQUESTS = 10;       // allowed per IP per window
const SESSION_MAX_REQUESTS = 6;   // allowed per session per window

// -------- Helpers --------
function getClientIp(request) {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach(p => {
    const i = p.indexOf("=");
    if (i > -1) {
      const k = p.slice(0, i).trim();
      const v = p.slice(i + 1).trim();
      if (k) out[k] = v;
    }
  });
  return out;
}

function getSessionId(request) {
  // Priority: explicit header, then cookie
  const hdr = request.headers.get("x-session-id");
  if (hdr) return hdr;
  const cookies = parseCookies(request.headers.get("cookie") || "");
  return cookies["tsh_sid"] || cookies["sid"] || "";
}

async function incrementAndCheck(key, limit, ttlSeconds) {
  const current = (await get(key)) || 0;
  if (Number(current) >= limit) return { allowed: false, current: Number(current) };
  const now = Math.floor(Date.now() / 1000);
  const ttl = ttlSeconds - (now % ttlSeconds);
  await set(key, Number(current) + 1, { expirationTtl: ttl });
  return { allowed: true, current: Number(current) + 1 };
}

// -------- Edge Guard --------
export default async (request, context) => {
  // Allow preflight to pass quickly
  if (request.method === "OPTIONS") {
    return context.next();
  }

  const now = Math.floor(Date.now() / 1000);
  const windowId = Math.floor(now / WINDOW_SECONDS);

  // IP-based limit
  const ip = getClientIp(request);
  const ipKey = `rl:ip:${ip}:${windowId}`;
  const ipCheck = await incrementAndCheck(ipKey, IP_MAX_REQUESTS, WINDOW_SECONDS);
  if (!ipCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests from this IP. Please slow down." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(WINDOW_SECONDS),
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  // Session-based limit (only if we have a session id)
  const sid = getSessionId(request);
  if (sid) {
    const sidKey = `rl:sid:${sid}:${windowId}`;
    const sidCheck = await incrementAndCheck(sidKey, SESSION_MAX_REQUESTS, WINDOW_SECONDS);
    if (!sidCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests in this session. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(WINDOW_SECONDS),
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }

  // Continue to the serverless function
  return context.next();
};
