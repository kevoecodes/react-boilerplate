# Setup guide: Windows 10 / 11 (fresh machine)

Copy each command into **PowerShell**, in order. Steps marked **(Admin)** need an elevated window: Start menu →
type `PowerShell` → right-click → **Run as administrator**.

> **Before you start:** this app is only the frontend. It needs the
> **[laravel-boilerplate](https://github.com/kevoecodes/laravel-boilerplate)** API running at
> `http://localhost:8000`. Set that up first by following its
> [SETUP.md](https://github.com/kevoecodes/laravel-boilerplate/blob/main/SETUP.md). That guide also installs Git and
> vim, so you can skip step 1 here if you've done it.

**vim basics** (used for editing files): `i` starts typing, `Esc` stops, `:wq` + `Enter` saves and quits, `:q!`
quits without saving. Lines below that start with `:` are vim commands. Press `Esc`, paste, then `Enter`.

**Refresh PATH:** installers only update PATH for new windows. Reopen PowerShell after each install, or run:

```powershell
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
```

---

## 1. Git and vim (skip if already installed)

Check:

```powershell
git --version; vim --version | Select-Object -First 1
```

If either is missing, confirm winget works first (`winget --version`; if not, update **App Installer** from the
Microsoft Store), then install (Admin):

```powershell
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
```

```powershell
winget install --id vim.vim -e --source winget --accept-package-agreements --accept-source-agreements
```

Add vim to PATH (its installer doesn't) (Admin):

```powershell
$vimDir = (Get-ChildItem 'C:\Program Files\Vim' -Directory -Filter 'vim*' | Sort-Object Name -Descending | Select-Object -First 1).FullName; [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path','Machine') + ";$vimDir", 'Machine')
```

Keep the repo's LF line endings:

```powershell
git config --global core.autocrlf false
```

Refresh PATH and re-run the check.

---

## 2. Node.js LTS

### Option A: winget (simplest) (Admin)

```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
```

### Option B: nvm-windows (switch between Node versions)

(Admin)

```powershell
winget install --id CoreyButler.NVMforWindows -e --source winget --accept-package-agreements --accept-source-agreements
```

Close PowerShell and open a new **Admin** window, then:

```powershell
nvm install lts
```

```powershell
nvm use lts
```

Use one option only. If Node is already installed from option A, uninstall it before using nvm.

### Verify

Refresh PATH (or reopen PowerShell), then:

```powershell
node -v
```

```powershell
npm -v
```

You need Node **18.18 or newer** (current LTS recommended).

---

## 3. The project

### 3.1 Clone

```powershell
mkdir $HOME\code -Force; cd $HOME\code
```

```powershell
git clone https://github.com/kevoecodes/react-boilerplate.git
```

```powershell
cd react-boilerplate
```

### 3.2 Install dependencies

```powershell
npm install
```

### 3.3 Create and edit `.env`

```powershell
Copy-Item .env.example .env
```

```powershell
vim .env
```

`VITE_API_URL` must point at the Laravel API, including `/api/v1` and without a trailing slash. The default is
right if the backend runs on port 8000:

```ini
VITE_API_URL=http://localhost:8000/api/v1
```

To change it with a vim command (`Esc`, paste, `Enter`):

```vim
:%s#^VITE_API_URL=.*#VITE_API_URL=http://localhost:8000/api/v1#
```

```vim
:wq
```

### 3.4 Run

Make sure the backend is up. In the laravel-boilerplate folder, `php artisan serve` should be running in another
window. Then:

```powershell
npm run dev
```

Open <http://localhost:5173> and sign in with:

| Email | Password |
| --- | --- |
| `admin@example.com` | `password` |

---

## 4. Backend first

The frontend has no data of its own. Every page loads from the API, so
**[laravel-boilerplate](https://github.com/kevoecodes/laravel-boilerplate)** must be running before you log in:

```powershell
cd $HOME\code\laravel-boilerplate; php artisan serve
```

Quick check that the API is reachable from PowerShell:

```powershell
Invoke-RestMethod http://localhost:8000/up
```

The API's `FRONTEND_URL` (in its `.env`) must be `http://localhost:5173`, the origin this app runs on. Otherwise
the browser blocks requests with a CORS error.

---

## 5. Troubleshooting

### `npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled`

PowerShell's execution policy blocks the `npm.ps1` shim. Allow local scripts for your user (once):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Or call the `.cmd` shim directly, which isn't affected: `npm.cmd install`, `npm.cmd run dev`.

### `Port 5173 is in use`

The dev server uses `strictPort`, so it stops instead of silently moving to another port. That's deliberate: the
API's CORS setting allows exactly `http://localhost:5173`. Find and stop whatever holds the port:

```powershell
Get-NetTCPConnection -LocalPort 5173 -State Listen | ForEach-Object { Get-Process -Id $_.OwningProcess }
```

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -State Listen).OwningProcess -Force
```

To use another port instead, run `npm run dev -- --port 5174` **and** add `http://localhost:5174` to `FRONTEND_URL`
in the backend's `.env` (comma-separated), then restart `php artisan serve`.

### CORS error in the browser console ("blocked by CORS policy")

- The backend's `FRONTEND_URL` must match the address bar exactly: `http://localhost:5173` and
  `http://127.0.0.1:5173` are **different** origins.
- After changing the backend `.env`, run `php artisan config:clear` and restart `php artisan serve`.
- A backend crash (500) can show up as a CORS error. Check `storage\logs\laravel.log` in laravel-boilerplate.

### Login says "Unable to reach the API" / `ERR_CONNECTION_REFUSED` / 404 on every request

- Is the backend running? Open <http://localhost:8000/api/v1/auth/me> in the browser. You should get
  `{"message":"Unauthenticated."}`.
- Check `VITE_API_URL` in `.env`: `http://localhost:8000/api/v1` (with `/api/v1`, no trailing slash, `http` not
  `https`).
- **Restart `npm run dev` after editing `.env`.** Vite only reads it at startup.
- Open the browser DevTools **Network** tab to see the exact URL being called.

### Logged out immediately / redirected to /login

The API returned `401`: the token expired, was revoked, or the database was re-seeded (`migrate:fresh` deletes
tokens). Sign in again.

### Line endings (`Delete ␍` errors from Prettier/ESLint, whole-file diffs)

The repo stores files with LF endings (`.gitattributes`, `.prettierrc.json`). If Git converted them to CRLF on
checkout:

```powershell
git config --global core.autocrlf false
```

```powershell
git rm --cached -r . -q; git reset --hard
```

(`reset --hard` discards uncommitted changes. Commit or stash first.) Then run `npm run format` to normalize any
files you created.

### `npm install` fails with `EPERM` / `EBUSY`

Another process (an editor, antivirus, a running `npm run dev`) is locking `node_modules`. Close them, then:

```powershell
Remove-Item -Recurse -Force node_modules; npm install
```
