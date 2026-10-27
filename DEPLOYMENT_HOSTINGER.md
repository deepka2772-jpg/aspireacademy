# Aspire Academy Online - Hostinger & Account Migration Guide

## 1. Master Admin Password (Admin Portal)
- **Default Master Admin Password:** `AspireAdmin@2026`
- **Admin Username / Email:** `admin@aspireacademyonline.in` (ya koi bhi identifier)
- **Zero Account Lockouts:** Yeh password kisi bhi specific Google account ya personal Gmail se binded nahi hai. Aap ise Admin Dashboard ke **Settings** tab se kabhi bhi change kar sakte hain.

---

## 2. Code Dusre GitHub Account Par Shift Kaise Karein
Agar aapko yeh poora code kisi naye GitHub account par shift karna hai:

```bash
# 1. Naya repository GitHub par create karein (e.g. yourname/aspire-academy)
# 2. Remote URL change karein:
git remote set-url origin https://github.com/<YOUR_NEW_USERNAME>/<YOUR_NEW_REPO>.git

# 3. Main branch ko push kar dein:
git push -u origin main
```

---

## 3. Hostinger Par Live Deploy Kaise Karein (Web Hosting / Cloud)

### Option A: Static Web Hosting (Sabse Easy & Fast)
1. Apne computer par project build karein:
   ```bash
   npm install
   npm run build
   ```
2. Build complete hone ke baad project me ek `dist/` folder ban jayega.
3. Hostinger File Manager kholiye -> `public_html/` directory me jayein.
4. `dist/` folder ke andar ki saari files (`index.html`, `assets/`, etc.) ko `public_html/` me upload kar dein.
5. Single Page Application (SPA) routing ke liye `public_html/.htaccess` file me yeh add karein:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### Option B: Hostinger VPS / Cloud (Node.js)
1. Hostinger VPS / Node.js app me repository link karein.
2. Build command: `npm install && npm run build`
3. Output directory: `dist`

---

## 4. Student & Admin Login (No Domain Restricting)
- **Students:** Kisi bhi domain par email aur password daal kar bina kisi `auth/unauthorized-domain` error ke direct account bana sakte hain aur login kar sakte hain.
- **Admin:** Master Admin Password `AspireAdmin@2026` daalkar 1-click me dashboard access kar sakte hain.
