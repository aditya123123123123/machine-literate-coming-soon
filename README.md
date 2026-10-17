# Machine Literate website

Source for [machineliterate.org](https://machineliterate.org): free AI lessons for kids in grades 5–8.

It's a plain static site (HTML, CSS, a little JavaScript) plus one serverless function for the waitlist. No framework, no build step.

```
public/          Everything the browser sees (index.html, get-involved.html, styles.css, assets/)
api/waitlist.js  Waitlist signup endpoint (Vercel serverless function)
tests/           Automated checks that run on every pull request
scripts/         Local dev server and admin helpers
vercel.json      Hosting config (clean URLs, security headers)
```

## Run it locally

You need [Node.js 24](https://nodejs.org).

```bash
git clone https://github.com/aditya123123123123/machine-literate-coming-soon.git
cd machine-literate-coming-soon
npm install
npm run dev        # http://localhost:3000
```

Locally the waitlist form works end to end, but it runs in **dry-run mode**: it validates and shows the success message without saving anything. Only the production site writes to the real waitlist, so you never need database credentials.

## Run the tests

```bash
npx playwright install chromium webkit   # first time only
npm test
```

This runs the API tests and the page checks (layout at four screen widths, the demo lesson and the waitlist form) in Chromium and WebKit. The same tests run automatically on every pull request.

## How changes get to the live site

```
your branch ──PR──▶ preprod ──release PR──▶ main ──▶ machineliterate.org
                     │                       
                     └─ preview link on every PR
```

1. Branch off `preprod` and open a pull request back into `preprod`.
2. GitHub runs the tests, and Vercel posts a preview link on the PR so you can see your change live.
3. A maintainer reviews and merges into `preprod`.
4. When `preprod` is ready, a maintainer opens a release PR from `preprod` to `main`. Merging into `main` deploys to machineliterate.org.

Nobody pushes straight to `main` or `preprod`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## License

Code is under the [MIT License](LICENSE). Fonts are under the SIL Open Font License (see `public/licenses/`). The Machine Literate name, logo and robot mascot are not covered by the code license.
