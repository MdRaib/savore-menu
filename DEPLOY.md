# SAVORÉ Live CMS

## Architecture
- `index.html` = public customer menu.
- `admin.html` = secure owner login + CMS.
- Supabase = authentication + database.
- Public visitors can read menu data but cannot write.
- Only authenticated Supabase users can use the admin write operations.

## 1. Create Supabase project
1. Create a Supabase project.
2. Open SQL Editor and run `supabase_schema.sql`.
3. In Authentication > Users, create the restaurant owner's email/password account.
4. Copy the Project URL and the **anon/public key**.
5. Put them into `supabase-config.js`.
6. Never expose the Supabase `service_role` key.

## 2. Deploy
Upload this folder to GitHub and deploy it with Netlify, Vercel, GitHub Pages (if static hosting requirements are satisfied), or another static host.

Public:
`https://YOUR-DOMAIN/index.html`

Owner:
`https://YOUR-DOMAIN/admin.html`

You can rename/rewrite the admin route to `/admin` when using a host that supports rewrites.

## 3. Important
This build deliberately does NOT put a visible Admin link on the public menu.
Authentication protects the admin operations. The database RLS policies prevent anonymous visitors from inserting/updating/deleting menu records.

For multiple restaurant clients, create separate Supabase projects or add an owner/restaurant_id tenancy layer before production.
