// Hearo Catalog Worker
//
// Serves the Hearo DOS audio player. Three categories of request:
//   1. /health                 - liveness probe
//   2. /tracks/*               - audio files streamed from R2
//   3. /catalog/* and /schema/* - JSON manifests proxied from GitHub raw
//
// DOS compatibility note: Hearo connects via mTCP, which speaks plain HTTP
// only. This Worker must never emit strict-transport-security, or browsers
// (and any HSTS-aware intermediary) would force the DOS client onto HTTPS
// it cannot negotiate.

const CATALOG_VERSION = "0.1.0";
const GITHUB_RAW = "https://raw.githubusercontent.com/tonyuatkins-afk/hearo-catalog/main";

const BASE_HEADERS = {
  "access-control-allow-origin": "*",
  "x-hearo-catalog": CATALOG_VERSION,
};

const FORMAT_CONTENT_TYPES = {
  mod: "audio/x-mod",
  s3m: "audio/x-s3m",
  xm: "audio/x-xm",
  it: "audio/x-it",
  stm: "audio/x-stm",
  "669": "audio/x-669",
  mtm: "audio/x-mtm",
  mid: "audio/midi",
  rmi: "audio/midi",
  mus: "audio/x-mus",
  wav: "audio/wav",
  voc: "audio/x-voc",
  mp3: "audio/mpeg",
  flac: "audio/flac",
  ogg: "audio/ogg",
  sbi: "application/octet-stream",
  ibk: "application/octet-stream",
  bnk: "application/octet-stream",
};

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...BASE_HEADERS,
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function notFound(path) {
  return jsonResponse(
    {
      error: "not_found",
      message: "No resource at the requested path.",
      path,
    },
    404,
  );
}

function methodNotAllowed(method) {
  return jsonResponse(
    {
      error: "method_not_allowed",
      message: "Only GET and HEAD are supported.",
      method,
    },
    405,
    { allow: "GET, HEAD" },
  );
}

async function handleHealth() {
  return jsonResponse({
    status: "ok",
    service: "hearo-catalog",
    version: CATALOG_VERSION,
    time: new Date().toISOString(),
  });
}

async function handleTrack(pathname, env, isHead) {
  // pathname is /tracks/<collection>/<id>.<ext>
  const key = pathname.replace(/^\/+/, "");

  if (!env.HEARO_BUCKET) {
    return jsonResponse(
      {
        error: "bucket_unavailable",
        message: "R2 binding HEARO_BUCKET is not configured.",
      },
      503,
    );
  }

  const object = isHead
    ? await env.HEARO_BUCKET.head(key)
    : await env.HEARO_BUCKET.get(key);

  if (!object) {
    return notFound(pathname);
  }

  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType =
    object.httpMetadata?.contentType ??
    FORMAT_CONTENT_TYPES[ext] ??
    "application/octet-stream";

  const headers = new Headers(BASE_HEADERS);
  headers.set("content-type", contentType);
  if (typeof object.size === "number") {
    headers.set("content-length", String(object.size));
  }
  if (object.httpEtag) {
    headers.set("etag", object.httpEtag);
  }

  if (isHead) {
    return new Response(null, { status: 200, headers });
  }

  return new Response(object.body, { status: 200, headers });
}

async function handleManifest(pathname) {
  // pathname is /catalog/* or /schema/*; map directly to the GitHub raw URL.
  const upstream = `${GITHUB_RAW}${pathname}`;

  const response = await fetch(upstream, {
    cf: { cacheTtl: 300, cacheEverything: true },
  });

  if (response.status === 404) {
    return notFound(pathname);
  }
  if (!response.ok) {
    return jsonResponse(
      {
        error: "upstream_error",
        message: "Failed to fetch manifest from origin.",
        status: response.status,
      },
      502,
    );
  }

  const headers = new Headers(BASE_HEADERS);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "public, max-age=300");

  return new Response(response.body, { status: 200, headers });
}

async function handleIndex() {
  return handleManifest("/catalog/index.json");
}

export default {
  async fetch(request, env, ctx) {
    const method = request.method.toUpperCase();
    if (method !== "GET" && method !== "HEAD") {
      return methodNotAllowed(method);
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const isHead = method === "HEAD";

    if (pathname === "/" || pathname === "") {
      return handleIndex();
    }

    if (pathname === "/health") {
      return handleHealth();
    }

    if (pathname.startsWith("/tracks/")) {
      return handleTrack(pathname, env, isHead);
    }

    if (pathname.startsWith("/catalog/") || pathname.startsWith("/schema/")) {
      return handleManifest(pathname);
    }

    return notFound(pathname);
  },
};
