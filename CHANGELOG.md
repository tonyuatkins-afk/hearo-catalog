# Changelog

All notable changes to Hearo Catalog are documented here.

## v1.0.0 - 2026-05-02

First release with the rights model and operational infrastructure in place.

### Added
- Content policy in COPYRIGHT.md establishing three hosting tiers (host, linkout, bandcamp) and six permission basis values
- Takedown procedure in TAKEDOWN.md with both informal and formal DMCA paths
- US Copyright Office registered DMCA designated agent (DMCA-1072235)
- Schema fields: `tier`, `permission_basis`, `permission_record`, `provenance_source`, `original_release_context`, `artist_real_name`
- Conditional schema validation: `host` tier requires `file` and `permission_basis`; `linkout` and `bandcamp` require non-empty `external_links` and forbid `permission_basis`; `bandcamp` and `artist_explicit_permission` require `permission_record`
- Top-level manifest `policy` block surfacing the copyright URL, takedown URL, and DMCA agent ID
- Format enum extended with `lds` (Loudness Sound System format used by Tyrian and other AdLib-targeted DOS games)
- Track ID uniqueness validation via `npm run validate`
- Artist outreach email templates in `docs/artist-outreach-templates.md`

### Changed
- catalog_version bumped from 0.1.0 to 1.0.0 (breaking manifest schema change: policy block now required)
- README.md "Curatorial philosophy" section expanded with a "How we handle rights" section
- CONTRIBUTING.md "Editorial standards" expanded to require tier, permission_basis, provenance_source, and permission_record per the rights model

### Notes
- The catalog ships with the same empty showcase as v0.1.0; track curation begins in v1.0.1
- DMCA agent registration must be renewed by May 2, 2029
