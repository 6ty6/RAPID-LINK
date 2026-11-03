# RapidLink Microfinance website redesign

Responsive React/Vite rebuild using JavaScript, React Router and plain CSS.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Other commands:

```bash
npm test
npm run build
npm run preview
npm run test:e2e
```

Playwright browser binaries are optional and can be installed with `npx playwright install chromium`.

## Configuration

Copy `.env.example` to `.env.local` only when verified integration values are available. Do not place secrets or CSRF tokens in Vite variables.

- `VITE_GENERAL_LOAN_PORTAL_URL`: verified public general-loan portal URL.
- `VITE_ACCOUNT_API_BASE_URL`: public origin for a future approved same-origin adapter. The current UI intentionally does not submit data.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`: public Supabase project configuration for the invitation-only vacancy portal.

## Careers management

The public vacancy grid is available at `/rapidlink-careers`. Authorised staff use the unlinked `/career-management` route to create, edit, publish, open or close vacancies.

To enable management securely:

1. Create or select the approved Supabase project and run `supabase/careers.sql` in its SQL editor.
2. Disable public user registration in Supabase Authentication and invite only approved staff.
3. Insert each approved staff user ID into `public.career_admins` as shown at the bottom of the SQL file.
4. Put the project URL and public anon key in `.env.local`, then rebuild the site.

Authorization is enforced by database row-level security, not by hiding the route. Never place a service-role key or staff password in a Vite environment variable.

The public build is configured for search-engine indexing. Keep production contact details and metadata accurate before deployment.

## Deploy to Render

This Vite application is configured as a Render Static Site in `render.yaml`.

1. Push the complete project to a GitHub, GitLab or Bitbucket repository.
2. Sign in to Render and choose **New > Blueprint**.
3. Connect the repository containing this project.
4. Render will read `render.yaml` and create `rapidlink-microfinance` with:
   - Build command: `npm ci && npm run build`
   - Publish directory: `dist`
   - React Router rewrite: `/*` to `/index.html`
5. Review any public `VITE_*` environment values before deploying. Leave unapproved integrations blank.
6. Apply the Blueprint and wait for the first deploy to complete.

The rewrite is required so refreshing routes such as `/contact`, `/rates` and `/institutional-profile` continues to load the React application. Render will automatically redeploy the site when new commits are pushed to the connected branch.
