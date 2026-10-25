/**
 * Trigger platform build on alg0rithm-app (workflow_dispatch).
 * Requires Vercel env: GH_PAT (GitHub token with actions:write on hammuod/alg0rithm-app)
 */

const OWNER = 'hammuod';
const APP_REPO = 'alg0rithm-app';

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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host || 'builds.alg0rithm.dev'}`);
  const platform = (url.searchParams.get('platform') || 'deb').toLowerCase();
  const file = WORKFLOWS[platform] || WORKFLOWS.linux;

  const token = process.env.GH_PAT || process.env.GITHUB_TOKEN;
  if (!token) {
    res.status(503).json({
      error: 'GH_PAT not configured on Vercel',
      help: 'Add environment variable GH_PAT (repo scope: actions) for project alg0rithm',
      manual: `https://github.com/${OWNER}/${APP_REPO}/actions/workflows/${file}`,
    });
    return;
  }

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

  if (r.status === 204 || r.ok) {
    res.status(202).json({
      status: 'triggered',
      platform,
      workflow: file,
      actions: `https://github.com/${OWNER}/${APP_REPO}/actions`,
      download_when_ready: `https://builds.alg0rithm.dev/api/dl?platform=${platform}`,
    });
    return;
  }

  res.status(r.status).json({
    error: await r.text(),
    workflow: file,
  });
};
