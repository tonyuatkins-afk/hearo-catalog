# Hearo Catalog Development Notes

## Project structure
- `worker/src/` contains the Cloudflare Worker source code
- `catalog/` contains JSON manifests served to Hearo clients
- `schema/` contains JSON Schema definitions for validation
- Audio files live in Cloudflare R2 under bucket name "hearo-catalog", not in this repo

## Style conventions
- No em dashes in any output text, including code comments, README, descriptions, JSON values
- Use straight quotes only
- All track IDs are lowercase with hyphens, no underscores or spaces
- All licenses must be explicit on every track, never blank or unclear

## Content policy and rights

Hearo Catalog is curated under a published content policy in COPYRIGHT.md and a takedown procedure in TAKEDOWN.md. Every track entry must satisfy the schema's required fields: `tier`, `license`, and `provenance_source`. Additionally, `host` tier entries require `permission_basis` and `file`; `linkout` and `bandcamp` entries require `external_links` and forbid `permission_basis`; `bandcamp` entries require `permission_record`; entries with `permission_basis: artist_explicit_permission` require `permission_record`.

The schema enforces all of these conditional rules. Run `npm run validate` before committing any track changes.

The `tier` field is `host`, `linkout`, or `bandcamp`. The `file` field must be a non-empty R2 path when tier is `host` and an empty string when tier is `linkout` or `bandcamp`. Never use null; always use empty string for the non-host case.

The `permission_basis` field is one of six enum values defined in COPYRIGHT.md. Never set it to a value not in the enum. Never invent new permission basis types; if a new value is genuinely needed, propose a schema change first.

When `permission_basis` is `artist_explicit_permission`, the `permission_record` object must be populated with date, channel, and scope (and ideally a reference URL or message ID). Same when `tier` is `bandcamp`.

## DMCA registration references

The DMCA agent registration number DMCA-1072235 appears in:

- COPYRIGHT.md (in the "DMCA designated agent" section)
- TAKEDOWN.md (in the "Formal DMCA notice" section)
- catalog/index.json (in the `policy.dmca_agent_id` field)
- README.md (in the "How we handle rights" section)

If this number ever changes (registration renewal under a new entity, agent change), update all four locations in the same commit. The renewal is due May 2, 2029.

## Deployment
- Pushes to main trigger automatic Worker deployment via GitHub Actions
- Only changes under worker/, wrangler.toml, or package.json trigger redeployment
- Catalog JSON updates do NOT require redeployment; they are fetched at request time
- Verify deployments via http://hearo.barelybooting.com/health

## When adding tracks

1. Confirm the track has a clear redistribution license; document the source and (for `host` tier) the permission basis
2. Determine the tier: `host`, `linkout`, or `bandcamp`
3. For `host` tier: upload the audio file to R2 under `tracks/<collection>/<id>.<ext>`
4. For `linkout` and `bandcamp` tiers: confirm the external URL is stable, set `file` to empty string, populate `external_links`
5. Add the track entry to the appropriate collection JSON in `catalog/collections/`, populating all required fields
6. Update the collection's `last_updated` field
7. Update the parent `index.json` `last_updated` and `track_count` if needed
8. Run `npm run validate` to validate against schemas and check track ID uniqueness
9. Commit and push

## When modifying the Worker
1. Edit worker/src/index.js
2. Test locally with `npm run dev` if Wrangler is configured
3. Commit and push; deployment is automatic
4. Verify via http://hearo.barelybooting.com/health

## DOS compatibility constraint
Hearo runs on DOS using the mTCP networking stack which speaks only plain HTTP, never HTTPS.
The Worker must NEVER set strict-transport-security headers in responses.
