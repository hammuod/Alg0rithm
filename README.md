# Alg0rithm

Alg0rithm is a minimalist educational platform built to simplify programming logic and algorithms. The project is strictly "No Bloat," using only Vanilla JavaScript, HTML, and CSS to achieve maximum performance.

## Philosophy & Core Values

* **No Bloat:** No heavy frameworks (no jQuery, no React). Uses minimal helper
  libraries (Bootstrap, Marked, Font Awesome) only where they directly improve UX.
* **Performance:** High speed and optimized SEO (100/100 Lighthouse ready).
* **Mastery:** Every line of code is reviewed 5 times to ensure perfection and security.
* **Ethics:** Developed by a team of 5 Arab developers committed to the highest moral and technical standards.

## Key Features

* **Visual Learning:** Clear, structured lessons presented in a simple format.
* **Offline Access:** Powered by a custom Service Worker for learning anytime, anywhere.
* **Pure Static:** Lightweight architecture (HTML/CSS/JS) with no heavy backend.
* **Markdown Ready:** Lessons are dynamically rendered from Markdown files for ease of contribution.
* **Internationalized:** One page for every language. The text is swapped in
  place from a JSON dictionary, with no page reload.

## Internationalization (i18n)

* **One page, three languages:** there is a single `index.html`, `docs.html`,
  `lap.html` and `404.html`. The language button (injected by `js/i18n.js`,
  highest `z-index` on the page) swaps the text in place — the page is never
  reloaded, a colored veil fades in, waits, then fades out to fully transparent.
* **Choice order:** `?lang=` in the URL (so a link can be shared in a language)
  → the saved choice in `localStorage` (`alg0rithm.lang`) → the browser
  languages → English.
* **Runtime:** `js/i18n.js` loads `/i18n/{lang}.json` and fills every element
  marked with `data-i18n` (text), `data-i18n-html`, `data-i18n-attr`
  (placeholder, aria-label, title…), `<meta data-i18n-content>` and
  `data-i18n-title` on `<html>`. Missing keys fall back to English, then to the
  text already present in the HTML.
* **Numbers:** inside a `data-i18n-digits` element (the lab bars and the step
  line) the digits become Arabic-Indic in Arabic.
* **RTL:** Arabic sets `dir="rtl"` on `<html>`; the mirroring rules live in
  `css/i18n.css`. The lab visualization keeps `dir="ltr"` so the bars read left
  to right.
* **Adding a language:** create `i18n/xx.json` with the same keys as
  `i18n/en.json`, then add the locale to `SUPPORTED` in `js/i18n.js`.
* **Adding a string:** add the English text to `i18n/en.json`, translate it in
  the other dictionaries, then mark the element in the page with the matching
  `data-i18n` key.

## Deployment & Updates

With over **80 deployments**, Alg0rithm is constantly evolving. Our team operates on a weekly rotation, ensuring daily updates and consistent project growth.

## Contributing

We welcome ethical contributors. Please read our `CONTRIBUTING.md` before submitting any pull requests. Remember: **You are free as long as you do no harm.**

## License

This project is licensed under the **AGPL-3.0 License**.
Original Creator: **Hammoud (hammuod)**

<p align="center">
  <img src="https://raw.githubusercontent.com/hammuod/Alg0rithm/main/imgs/icon.png" alt="Alg0rithm Logo" width="600">
</p>

---
"Complexity is the enemy of execution. We choose simplicity."
