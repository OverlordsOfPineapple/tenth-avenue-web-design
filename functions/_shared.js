const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

export function clean(value, maxLength = 3000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value, 200));
}

export function escapeHtml(value) {
  return clean(value, 5000)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function hashIp(request, env) {
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "unknown";

  const salt = env.IP_HASH_SALT || "tenth-avenue";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function rateLimited(env, ipHash) {
  if (!env.DB) return false;

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS total
       FROM leads
      WHERE ip_hash = ?1
        AND created_at >= ?2`,
  )
    .bind(ipHash, tenMinutesAgo)
    .first();

  return Number(row?.total || 0) >= 5;
}

export async function saveLead(env, lead) {
  if (!env.DB) {
    throw new Error("D1 database binding DB is not configured.");
  }

  await env.DB.prepare(
    `INSERT INTO leads
      (id, type, name, email, phone, business, message, ip_hash, user_agent, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
  )
    .bind(
      lead.id,
      lead.type,
      lead.name,
      lead.email,
      lead.phone,
      lead.business,
      lead.message,
      lead.ipHash,
      lead.userAgent,
      lead.createdAt,
    )
    .run();
}

export async function sendNotification(env, lead) {
  if (!env.RESEND_API_KEY || !env.LEAD_TO_EMAIL || !env.RESEND_FROM_EMAIL) {
    return { skipped: true };
  }

  const subject =
    lead.type === "quote"
      ? `New website quote request from ${lead.name}`
      : `New website enquiry from ${lead.name}`;

  const html = `
    <h1>${escapeHtml(subject)}</h1>
    <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(lead.phone || "Not provided")}</p>
    <p><strong>Business:</strong> ${escapeHtml(lead.business || "Not provided")}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(lead.message).replaceAll("\n", "<br>")}</p>
    <hr>
    <p>Received ${escapeHtml(lead.createdAt)}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
      "idempotency-key": `lead/${lead.id}`,
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [env.LEAD_TO_EMAIL],
      reply_to: lead.email,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Resend notification failed: ${message.slice(0, 500)}`);
  }

  return response.json();
}

export async function parseRequest(request, type) {
  if (request.method !== "POST") {
    return {
      error: json({ ok: false, error: "Method not allowed." }, 405),
    };
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {
      error: json({ ok: false, error: "JSON request required." }, 415),
    };
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return {
      error: json({ ok: false, error: "Invalid JSON." }, 400),
    };
  }

  if (clean(body.website, 300)) {
    return {
      error: json({ ok: true, message: "Enquiry received." }, 201),
    };
  }

  const lead = {
    id: crypto.randomUUID(),
    type,
    name: clean(body.name, 100),
    email: clean(body.email, 160),
    phone: clean(body.phone, 80),
    business: clean(body.business, 160),
    message: clean(body.message || body.details, 3000),
    createdAt: new Date().toISOString(),
    userAgent: clean(request.headers.get("user-agent"), 500),
  };

  if (!lead.name || !validEmail(lead.email) || !lead.message) {
    return {
      error: json(
        {
          ok: false,
          error: "Name, valid email and project details are required.",
        },
        400,
      ),
    };
  }

  return { lead };
}

export async function handleLead(context, type) {
  try {
    const parsed = await parseRequest(context.request, type);
    if (parsed.error) return parsed.error;

    const lead = parsed.lead;
    lead.ipHash = await hashIp(context.request, context.env);

    if (await rateLimited(context.env, lead.ipHash)) {
      return json(
        {
          ok: false,
          error: "Too many enquiries were submitted. Please try again later.",
        },
        429,
      );
    }

    await saveLead(context.env, lead);

    context.waitUntil(
      sendNotification(context.env, lead).catch((error) => {
        console.error(error);
      }),
    );

    return json(
      {
        ok: true,
        message: "Thanks—your enquiry has been received.",
        leadId: lead.id,
      },
      201,
    );
  } catch (error) {
    console.error(error);
    return json(
      {
        ok: false,
        error: "The enquiry could not be sent. Please call (+61) 430 535 096.",
      },
      500,
    );
  }
}
