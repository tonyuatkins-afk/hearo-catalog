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

## Deployment
- Pushes to main trigger automatic Worker deployment via GitHub Actions
- Only changes under worker/, wrangler.toml, or package.json trigger redeployment
- Catalog JSON updates do NOT require redeployment; they are fetched at request time
- Verify deployments via http://hearo.barelybooting.com/health

## When adding tracks
1. Confirm the track has a clear redistribution license, document the source
2. Upload the audio file to R2 under tracks/<collection>/<id>.<ext>
3. Add the track entry to the appropriate collection JSON in catalog/collections/
4. Update the collection's last_updated field
5. Update the parent index.json track_count if needed
6. Commit and push

## When modifying the Worker
1. Edit worker/src/index.js
2. Test locally with `npm run dev` if Wrangler is configured
3. Commit and push; deployment is automatic
4. Verify via http://hearo.barelybooting.com/health

## DOS compatibility constraint
Hearo runs on DOS using the mTCP networking stack which speaks only plain HTTP, never HTTPS.
The Worker must NEVER set strict-transport-security headers in responses.
