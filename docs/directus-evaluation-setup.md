# Directus evaluation setup

**Branch:** `cms-evaluation/directus`  
**Purpose:** Test Directus without changing the existing Supabase prototype or production branch.

## What was added

The website now has one small Directus public-content adapter. No page was
duplicated and no Directus SDK was installed. The browser uses its built-in
`fetch` support, keeping the evaluation removable and the production bundle
small.

Set these values only in the Directus evaluation environment:

```text
VITE_CONTENT_SOURCE=directus
VITE_DIRECTUS_URL=https://YOUR-DIRECTUS-TEST-INSTANCE
```

Leaving `VITE_CONTENT_SOURCE=supabase` preserves the existing implementation.
Using `local` loads the bundled demonstration records.

## Test collections

Create only these two collections first. Use synthetic records; do not connect
the trial to the hosted production database.

### `news_articles`

| Field | Directus type | Required |
|---|---|---|
| `slug` | String | Yes; unique |
| `title` | String | Yes |
| `category` | String | Yes |
| `published_at` | Date | Yes |
| `summary` | Text | Yes |
| `image` | File or String | Yes |
| `image_alt` | String | Yes |
| `featured` | Boolean | Yes; default false |
| `is_published` | Boolean | Yes; default false |
| `sections` | JSON | Yes; default `[]` |
| `external_link` | String | No |
| `external_label` | String | No |

### `career_vacancies`

| Field | Directus type | Required |
|---|---|---|
| `id` | UUID | Yes |
| `title` | String | Yes |
| `department` | String | Yes |
| `location` | String | Yes |
| `employment_type` | String | Yes |
| `summary` | Text | Yes |
| `responsibilities` | JSON | Yes; default `[]` |
| `status` | String | Yes; `open` or `closed` |
| `is_published` | Boolean | Yes; default false |
| `application_email` | String | Yes |
| `created_at` | DateTime | Yes; automatic |

## Public permissions

The Directus Public role may receive read access only. Restrict items to
`is_published = true` and allow only the fields listed above. Do not grant the
Public role create, update, delete, file-upload or administrative permissions.

Create separate Writer, Reviewer and Administrator test accounts. The first
evaluation must prove that a Writer cannot publish and that public requests
cannot retrieve a draft before the website is connected to the trial.

## Connection test

After the collections, permissions and synthetic records exist:

1. Put the two environment values in `.env.local` or the isolated Render preview.
2. Start the website with `npm.cmd run dev`.
3. Open `/stories` and `/rapidlink-careers`.
4. Confirm only published synthetic records appear.
5. Set one record to draft and confirm it disappears from both API and website.

Do not copy credentials, administrator tokens or production customer data into
the website environment. Public content reads require no token when the
Directus Public role is configured correctly.
