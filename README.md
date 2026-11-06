# Resume & Portfolio Site

A public page to send to recruiters, plus a password-protected admin panel for editing it without touching code.

- **Public site:** `/`, with a permanent CV link at `/cv`
- **Admin panel:** `/admin`, which redirects to `/login` when you aren't signed in

Built with Next.js, TypeScript, Tailwind CSS, Drizzle ORM and libSQL (a local file in development, Turso in production).

## Run it locally

```powershell
npm install
npm run setup     # creates .env.local and prints your local login once
npm run db:migrate
npm run db:seed   # first-time content from the CV
npm run dev
```

Then open <http://localhost:3000> and <http://localhost:3000/admin>.

Lost your local login? Delete `.env.local` and run `npm run setup` again. Your content isn't affected.

## Editing content

Everything is edited at `/admin`. Saving updates the public page straight away.

| Section | What it holds |
|---|---|
| Profile | Name, headline, about text, email, photo, CV, "Open to work" badge |
| Experience, Projects, Education | Entries you can reorder, hide as drafts, edit or delete |
| Skills | Grouped by whatever you type as the category |
| Links | GitHub, LinkedIn and other profiles |

A section with nothing in it is hidden on the public site.

## Deploy to Vercel

Vercel's disk doesn't keep files between requests, so production needs a hosted database and file storage.

**1. Create a Turso database** at <https://turso.tech>. Copy its URL (`libsql://...`) and an auth token.

**2. Generate a production login.** Use a different password from your local one:

```powershell
npm run admin:password
```

Save the password in a password manager. The other value it prints is your `ADMIN_PASSWORD_HASH`. To hash a password you chose instead, run `npm run admin:password -- "your password"`.

**3. Push the code to a private GitHub repository and import it into Vercel.** Keep the repository private, because `public/Chornopyskyi_Kyrylo_CV.pdf` contains your phone number.

**4. Set these environment variables in Vercel:**

| Name | Value |
|---|---|
| `ADMIN_USERNAME` | The username you'll log in with |
| `ADMIN_PASSWORD_HASH` | From step 2 |
| `SESSION_SECRET` | A new random value of at least 32 characters. To generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `TURSO_DATABASE_URL` | From step 1 |
| `TURSO_AUTH_TOKEN` | From step 1 |
| `NEXT_PUBLIC_SITE_URL` | Optional. Your own domain, if you have one |

**5. Connect a Blob store** under the project's Storage tab in Vercel. This adds `BLOB_READ_WRITE_TOKEN`, which photo, screenshot and CV uploads need. Redeploy afterwards.

**6. Add your starting content** to the production database, once, from your own computer:

```powershell
$env:TURSO_DATABASE_URL="libsql://..."; $env:TURSO_AUTH_TOKEN="..."
npm run db:migrate
npm run db:seed
Remove-Item Env:TURSO_DATABASE_URL, Env:TURSO_AUTH_TOKEN
```

Seeding does nothing if the database already has a profile, so it can't overwrite your edits. Each Vercel build applies new database migrations automatically.

**7.** Open the page and redeploy once if it still shows "Your Name", because the first build ran before the content existed.

## Security

- Every admin page and action checks the session on the server. Actions check it themselves, because a server action can be called by a POST to any route, not only under `/admin`.
- Passwords are stored only as scrypt hashes. Sessions are signed, `httpOnly` cookies that last 7 days.
- Login allows 5 attempts per IP address per 15 minutes.
- Uploads are identified by their content rather than their file name. Only PNG, JPG, WebP and PDF are accepted, up to 4 MB.
- Link fields only accept `http` and `https` addresses.

To log out every session, change `SESSION_SECRET`.

## Adding a new section

The admin pages and validation are generated from `src/admin/collections.ts`:

1. Add a table in `src/db/schema.ts`, then run `npm run db:generate`.
2. Add an entry to `collections` in `src/admin/collections.ts`.
3. Add the table to the `tables` maps in `src/app/admin/actions.ts` and the `src/app/admin/[collection]` pages.
4. Query it in `src/db/queries.ts` and display it in `src/app/page.tsx`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Applies migrations and starts the development server |
| `npm test` | Runs the login and validation tests |
| `npm run typecheck` | Checks types |
| `npm run build` | Applies migrations and builds for production |
| `npm run db:generate` | Creates a migration after a schema change |
| `npm run admin:password` | Generates a new admin password and hash |
