# Pinkas Tzedakah

A donations ledger ("pinkas") web app, in two versions.

## full/

The full version. Live at https://pinkas-app.surge.sh

- Users sign in with email and password; data is stored in Supabase.
- The database setup (tables, security rules, functions) is in `full/schema.sql`. Run it in the Supabase SQL editor of a new project.
- `full/app.js` holds the Supabase project URL and the public (publishable) key. That key is public by design; access is controlled by the row-level security rules in `schema.sql`.
- `full/supabase.js` is the Supabase JavaScript client library.

## demo/

A demo version with no server. Data stays in the visitor's own browser. Live at https://pinkas-tzedakah.surge.sh

## Hosting

Both folders are plain static files (HTML, CSS, JavaScript), hosted on Surge (https://surge.sh). The `CNAME` file in each folder tells Surge which address to publish to. To publish a folder: `surge ./full` (or `./demo`).
