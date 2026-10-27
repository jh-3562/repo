console.log("function import Adresses_FichierAimporter", context);

const WEBHOOK_URL = N8N_IMPORT;

const safeParse = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  const s = String(raw).trim();
  if (s.startsWith("{") || s.startsWith("[")) {
    try { return JSON.parse(s); } catch { return null; }
  }
  return s;
};

(async () => {
  try {
    const rawFile = docData?.Adresses_FichierAimporter;
    const FichierAImporter = safeParse(rawFile);

    if (!FichierAImporter) {
      throw new Error("Champ vide ou invalide: Adresses_FichierAimporter");
    }

    const payload = { FichierAImporter };

    const resp = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let body = text;
    try { body = JSON.parse(text); } catch {}

    if (!resp.ok) {
      const msg =
        (body && (body.message || body.error)) ||
        `Erreur webhook (code ${resp.status})`;
      throw new Error(msg);
    }

    console.log("[IMPORT][OK]", body);
    return { ok: true, status: resp.status, body, sent: payload };
  } catch (e) {
    console.error("[IMPORT][ERROR]", e);
    return { ok: false, error: e?.message || String(e) };
  }
})();
