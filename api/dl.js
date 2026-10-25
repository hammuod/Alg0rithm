/**
 * builds.alg0rithm.dev / packages.alg0rithm.dev download resolver
 * Finds the latest asset from hammuod/alg0rithm-app releases and redirects (temporary link).
 * Optional: ?build=1 triggers a GitHub Actions workflow first (needs GH_PAT env).
 */

const OWNER = 'hammuod';
const APP_REPO = 'alg0rithm-app';

const PLATFORM_MATCH = {
  windows: [/windows/i, /\.exe$/i, /portable.*zip/i],
  win: [/windows/i, /portable/i],
  macos: [/macos/i, /mac/i, /\.dmg$/i, /\.app/i],
  mac: [/macos/i, /mac/i],
  android: [/android/i, /\.apk$/i],
  apk: [/android/i, /\.apk$/i],
  linux: [/linux/i, /\.deb$/i, /appimage/i, /tarball/i],
  deb: [/\.deb$/i],
  rpm: [/\.rpm$/i],
  arch: [/arch/i, /pkgbuild/i],
  alpine: [/alpine/i],
  appimage: [/appimage/i],
  tarball: [/tarball/i, /linux-any/i],
};

async function github(path) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'alg0rithm-dl',
  };
  const token = process.env.GH_PAT || process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function pickAsset(assets, platform) {
  const rules = PLATFORM_MATCH[platform] || [new RegExp(platform, 'i')];
  // Prefer non-sha256 files
  const files = assets.filter((a) => !/\.sha256$/i.test(a.name));
  for (const rule of rules) {
    const hit = files.find((a) => rule.test(a.name));
    if (hit) return hit;
  }
  return files[0] || null;
}

async function triggerBuild(platform) {
  const token = process.env.GH_PAT || process.env.GITHUB_TOKEN;
  if (!token) return { ok: false, reason: 'no_token' };

  const workflowMap = {
    windows: 'windows.yml',
    win: 'windows.yml',
    macos: 'macos.yml',
    mac: 'macos.yml',
    android: 'android.yml',
    apk: 'android.yml',
    deb: 'deb.yml',
    rpm: 'rpm.yml',
    arch: 'arch.yml',
    alpine: 'alpine.yml',
    appimage: 'appimage.yml',
    tarball: 'tarball.yml',
    linux: 'deb.yml',
  };
  const file = workflowMap[platform] || 'deb.yml';

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${APP_REPO}/actions/workflows/${file}/dispatches`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'alg0rithm-dl',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  );
  if (res.status === 204 || res.ok) return { ok: true, workflow: file };
  return { ok: false, reason: await res.text() };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host || 'builds.alg0rithm.dev'}`);
    let platform = (url.searchParams.get('platform') || url.searchParams.get('p') || '').toLowerCase();

    // path style: /api/dl/windows or /export/windows.exe
    if (!platform) {
      const parts = url.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1] || '';
      platform = last.replace(/\.(exe|apk|dmg|deb|rpm|zip|tar\.gz)$/i, '').toLowerCase();
      if (platform === 'dl' || platform === 'export') platform = '';
    }

    if (!platform) {
      res.status(400).json({
        error: 'platform required',
        examples: [
          '/api/dl?platform=windows',
          '/api/dl?platform=android',
          '/api/dl?platform=deb',
          '/export/windows.exe',
        ],
      });
      return;
    }

    const wantBuild = url.searchParams.get('build') === '1' || url.searchParams.get('build') === 'true';
    if (wantBuild) {
      const trig = await triggerBuild(platform);
      if (url.searchParams.get('json') === '1') {
        res.status(202).json({
          status: 'build_triggered',
          platform,
          trigger: trig,
          message: 'Build started on GitHub Actions. Retry download in 1–3 minutes.',
          retry: `/api/dl?platform=${platform}`,
        });
        return;
      }
    }

    let release;
    try {
      release = await github(`/repos/${OWNER}/${APP_REPO}/releases/latest`);
    } catch (e) {
      // no releases yet
      if (wantBuild || true) {
        await triggerBuild(platform);
      }
      res.status(202).json({
        status: 'no_release_yet',
        platform,
        message:
          'No release assets yet. A build was requested. Push tag `build` on alg0rithm-app or wait for workflow, then retry.',
        actions: `https://github.com/${OWNER}/${APP_REPO}/actions`,
        releases: `https://github.com/${OWNER}/${APP_REPO}/releases`,
      });
      return;
    }

    const asset = pickAsset(release.assets || [], platform);
    if (!asset) {
      res.status(404).json({
        status: 'asset_not_found',
        platform,
        release: release.tag_name,
        available: (release.assets || []).map((a) => a.name),
        message: 'Trigger a build for this platform, then retry.',
        build: `/api/dl?platform=${platform}&build=1&json=1`,
      });
      return;
    }

    // Temporary download URL (GitHub asset — browser gets the file)
    const tempUrl = asset.browser_download_url;
    const expiresHint = 'GitHub release asset (stable until next release)';

    if (url.searchParams.get('json') === '1') {
      res.status(200).json({
        status: 'ready',
        platform,
        name: asset.name,
        size: asset.size,
        tag: release.tag_name,
        url: tempUrl,
        temporary: true,
        note: expiresHint,
      });
      return;
    }

    res.statusCode = 302;
    res.setHeader('Location', tempUrl);
    res.setHeader('X-Alg0rithm-Asset', asset.name);
    res.setHeader('X-Alg0rithm-Tag', release.tag_name);
    res.end();
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
