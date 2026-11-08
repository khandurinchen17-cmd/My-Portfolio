# Rinchen Khandu — Personal Portfolio

A responsive personal portfolio site built with HTML, CSS, and vanilla JavaScript.

## Before you submit — personalize it

Search the project for `TODO` comments and replace every one with your real
information. At minimum:

- `index.html` — bio text in **About**, your real skills, your real **projects**
  with real repository links, your real education details, and real contact
  info (email, GitHub, LinkedIn) in **Contact**.
- Replace the placeholder GitHub links in the Projects section with links to
  your actual repositories (or remove projects you don't have yet and add
  your real ones — you need at least three).
- The contact form has no backend attached. It currently falls back to
  opening the visitor's email client via `mailto:`. If you want an actual
  working form, connect a free service like
  [Formspree](https://formspree.io) or [EmailJS](https://www.emailjs.com)
  and update the `<form>` in `index.html` plus the submit handler in
  `js/script.js`.

## Run it locally

No build step needed. Either:

- Open `index.html` directly in a browser, or
- Serve it locally so the fonts and relative paths load cleanly:
  ```
  python3 -m http.server 8000
  ```
  then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a new GitHub repository and push this project to it:
   ```
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch",
   branch `main`, folder `/ (root)`.
4. Save. Your site will be live at
   `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Deploy to Vercel (alternative)

1. Push the project to a GitHub repository (steps above).
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and click
   **Add New → Project**.
3. Select your repository. Framework preset: "Other" (static site) —
   no build command needed.
4. Click **Deploy**. Vercel gives you a live URL immediately.

## Project structure

```
index.html        Page markup and content
css/style.css      All styling
js/script.js       Nav menu, scroll-spy, hero animation, project filter,
                    copy-email button, contact form handling
README.md          This file
submission.txt      Fill in your links here before submitting
```
