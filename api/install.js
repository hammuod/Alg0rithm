/** Proxy install.sh from alg0rithm-app for packages.alg0rithm.dev/install.sh */
module.exports = async function handler(req, res) {
  const src =
    'https://raw.githubusercontent.com/hammuod/alg0rithm-app/main/install.sh';
  const r = await fetch(src, { headers: { 'User-Agent': 'alg0rithm-install' } });
  if (!r.ok) {
    res.status(502).send('# failed to fetch install.sh\n');
    return;
  }
  const body = await r.text();
  res.setHeader('Content-Type', 'text/x-shellscript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).send(body);
};
