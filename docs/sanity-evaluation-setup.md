# Sanity CMS evaluation setup

This branch evaluates Sanity without changing RapidLink's production content source. The public React pages keep their existing content contract; only the repository adapter changes.

## Why this setup stays small

- The website reads Sanity's public CDN with native `fetch`, so no Sanity SDK is added to the production bundle.
- No secret token is stored in the frontend.
- Only news and vacancies are included in the first evaluation.
- Studio dependencies are not installed until a free Sanity project exists.

## Create the free project

1. Sign in at <https://www.sanity.io/manage>.
2. Create a project named **RapidLink CMS Evaluation** on the **Free** plan.
3. Keep the default public dataset named `production`.
4. The evaluation project ID is `04unhu7g`. A project ID is public configuration, not a password.

Do not add billing details, production customer data, Supabase credentials or real unpublished company information to this evaluation.

## Studio schema

The two prepared document types are in `cms/sanity/schemaTypes`:

- `newsArticle`
- `careerVacancy`

The standalone Studio is in `cms/sanity/studio` and imports these shared schema types. Its dependencies and build output remain isolated from the public website.

Run it locally from the repository root with:

```text
npm --prefix cms/sanity/studio run dev
```

The first visit asks you to sign in to the Sanity account that owns project `04unhu7g`.

## Connect the website preview

Set these values only on the Sanity preview service or in an uncommitted local `.env.local`:

```text
VITE_CONTENT_SOURCE=sanity
VITE_SANITY_PROJECT_ID=04unhu7g
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2026-11-14
```

In Sanity Manage, open **Settings > API settings > CORS Origins** and add the exact preview origin. Do not allow credentials for public website reads.

## Evaluation checks

1. Create an unpublished news article and confirm it does not appear publicly.
2. Publish it and enable **Visible on website**; confirm it appears on Stories and the homepage where applicable.
3. Upload an image and confirm its description is required.
4. Create, close and unpublish a vacancy and verify each public state.
5. Invite a second test user and record what the Free plan's two available roles can and cannot do.
6. Record editing usability, preview experience, audit/history limitations, migration effort, ownership and estimated operating cost.

The Sanity Free plan permits public datasets only. This makes it suitable for published marketing content, but unpublished material and editorial access must be assessed carefully before recommending it for production.
