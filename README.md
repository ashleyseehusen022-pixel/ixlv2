
# Phonk Systems v5.4 - Unblocked Portal

A high-performance, stealth-focused unblocked games portal with AI game generation and built-in proxy mirrors.

## Features
- **Arcade Repository**: Hand-picked unblocked classics like Phonk Snake and 3D Hoops.
- **AI Game Dev**: Generate custom Phonk-style games using Gemini.
- **Phonk-VPN**: Built-in proxy and mirror system.
- **Stealth Mode**: Deploy to `about:blank` and mask tab identity.
- **Optional Lock**: Set a custom key to hide the app from prying eyes.

## Deployment Instructions

### 1. Local Setup
```bash
npm install
npm run dev
```

### 2. Deploying to GitHub Pages (Automated)
1. Push this code to a **GitHub** repository.
2. Go to **Settings > Actions > General** and ensure "Read and write permissions" are enabled for `GITHUB_TOKEN`.
3. Go to **Settings > Secrets and variables > Actions**.
4. Add a Repository secret named `API_KEY` with your Gemini API Key.
5. Push to the `main` branch. The `.github/workflows/deploy.yml` file will automatically build and deploy your site.

### 3. Deploying to Vercel
1. Push this code to GitHub.
2. Connect the repository to [Vercel](https://vercel.com).
3. Add `API_KEY` to Environment Variables.
4. Deploy.

### 4. Stealth Tips
- Use the **PUBLISH (STEALTH)** button in the app to open the portal in an `about:blank` tab.
- This tab won't show up in your history and is much harder for filters to track.
