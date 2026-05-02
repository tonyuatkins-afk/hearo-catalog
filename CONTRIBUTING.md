# Contributing to Hearo Catalog

Thanks for your interest. This document covers how to suggest tracks, propose collections, and submit code changes.

## Data model

The catalog has three layers, kept deliberately separate:

1. **Audio files** live in Cloudflare R2 under bucket `hearo-catalog`, keyed as `tracks/<collection>/<id>.<ext>`. They are NOT stored in this git repository.
2. **Catalog metadata** lives in this repository under `catalog/`. The top-level index is `catalog/index.json`, and each collection lives at `catalog/collections/<id>.json`.
3. **Schemas** live under `schema/` and formally define what a valid track, collection, or manifest looks like. They are JSON Schema draft-07.

If you want to understand the contract, start with the schemas. They are the source of truth.

## Editorial standards

Every track that goes into the catalog must meet all of the following:

- **Explicit license.** The `license` field is required to be unambiguous. "Public domain", "CC BY 4.0", "permission granted by author 2025-XX-XX with email on file", and similar are all fine. Blank, "unknown", or "probably ok" are not. If we cannot establish redistribution rights, we do not host it.
- **Hardware recommendations populated.** The whole point of Hearo is matching music to hardware. A track without `hardware_recommendations` does not earn its place.
- **A real description.** The `description` field should explain why this track is in the catalog. What does it showcase? What hardware sings on it? What should a listener notice? Generic blurbs do not help anyone.
- **A clear source.** The `source` field should point at the original release or canonical archive entry, not a random reupload.

## Suggesting a track

Open a GitHub issue using the "Suggest a track" template (or just a plain issue if no template is available) and include:

- Title, artist, year, format
- Link to the source (original release, Mod Archive entry, demoscene party result page, etc.)
- License proof (license URL, author permission, public domain status, etc.)
- A short pitch: why does this belong in Hearo? What hardware does it shine on?

A maintainer will review the suggestion, sort out R2 upload and metadata, and credit you on merge. Please do not open a pull request that adds a track directly; track addition needs the R2 side too and is easier to do as a single curated change.

## Suggesting a new collection

Open a GitHub Discussion or issue describing the collection: its theme, roughly how many tracks, why it is distinct from existing collections, and a few candidate tracks. Collections are first-class editorial units, so they need a clear identity before we add them.

## Code contributions

Pull requests for the Worker, schemas, and tooling are welcome.

1. Fork the repo and create a feature branch
2. Make your changes; keep diffs focused
3. If you change the Worker, test locally with `npm run dev`
4. If you change a schema, validate the existing catalog files against it
5. Open a PR with a clear description of what changed and why

Style notes that apply to all text we ship (code comments, JSON values, docs):

- No em dashes
- Straight quotes only
- Lowercase-with-hyphens for all IDs

## Adding a track end to end

For maintainers, the full flow is:

1. Confirm the track has a clear redistribution license, document the source
2. Upload the audio file to R2 under `tracks/<collection>/<id>.<ext>`
3. Add the track entry to the appropriate collection JSON in `catalog/collections/`
4. Update the collection's `last_updated` field
5. Update the parent `index.json` `track_count` if needed
6. Commit and push; the catalog change does not redeploy the Worker, but is served fresh within the 300 second edge cache window
