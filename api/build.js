/** Trigger build on hammuod/Alg0rithm — needs GH_PAT on Vercel
 *  ?platform=deb|windows|...|all
 */
const OWNER = 'hammuod';
const APP_REPO = 'Alg0rithm';

const WORKFLOWS = {
  windows: 'windows.yml',
  macos: 'macos.yml',
  android: 'android.yml',
  deb: 'deb.yml',
  rpm: 'rpm.yml',
  arch: 'arch.yml',
  alpine: 'alpine.yml',
  appimage: 'appimage.yml',
  tarball: 'tarball.yml',
  linux: 'deb.yml',
};

const ALL_KEYS = [
  'deb', 'rpm', 'arch', 'alpine', 'tarball', 'appimage',
  'windows', 'macos', 'android',
];

async function dispatch(token, file) {
  const r = await fetch(
    `https://api.github.com/repos/${OWNER}/${APP_REPO}/actions/workflows/${file}/dispatches`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'alg0rithm-build',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  );
  if (r.status === 204 || r.ok) return { ok: true, workflow: file };
  return { ok: false, workflow: file, error: await r.text() };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host || 'api.alg0rithm.dev'}`);
  const platform = (url.searchParams.get('platform') || 'deb').toLowerCase();
  const token = process.env.GH_PAT || process.env.GITHUB_TOKEN;

  if (!token) {
    res.status(503).json({
      error: 'GH_PAT not configured on Vercel',
      help: 'Vercel → alg0rithm → Settings → Environment Variables → GH_PAT',
      manual: `https://github.com/${OWNER}/${APP_REPO}/actions`,
    });
    return;
  }

  // Build everything
  if (platform === 'all' || platform === '*') {
    const results = [];
    for (const key of ALL_KEYS) {
      const file = WORKFLOWS[key];
      // small delay avoids secondary rate limits
      if (results.length) await new Promise((r) => setTimeout(r, 400));
      results.push({ platform: key, ...(await dispatch(token, file)) });
    }
    const ok = results.filter((x) => x.ok).length;
    res.status(202).json({
      status: 'triggered_all',
      platform: 'all',
      triggered: ok,
      total: results.length,
      results,
      actions: `https://github.com/${OWNER}/${APP_REPO}/actions`,
      releases: `https://github.com/${OWNER}/${APP_REPO}/releases/tag/build`,
      download: 'https://api.alg0rithm.dev/dl?platform=windows',
    });
    return;
  }

  const file = WORKFLOWS[platform];
  if (!file) {
    res.status(400).json({
      error: 'unknown platform',
      platform,
      allowed: [...Object.keys(WORKFLOWS), 'all'],
    });
    return;
  }

  const result = await dispatch(token, file);
  if (result.ok) {
    res.status(202).json({
      status: 'triggered',
      platform,
      workflow: file,
      actions: `https://github.com/${OWNER}/${APP_REPO}/actions`,
      download_when_ready: `https://api.alg0rithm.dev/dl?platform=${platform}`,
    });
    return;
  }
  res.status(502).json({ status: 'failed', ...result });
};
