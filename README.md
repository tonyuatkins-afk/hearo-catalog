# Hearo Catalog

Hearo Catalog is a small Cloudflare Workers service that serves curated music files and metadata to [Hearo](https://github.com/barelybooting/hearo), a DOS audio player targeting vintage PC hardware from the 8088 through the Pentium II era. The catalog is hardware-aware: every track carries metadata about which vintage configurations it sounds best on, so the player can surface music that suits your machine.

## Architecture

Three pieces, glued together:

1. **Cloudflare Worker** (`worker/src/index.js`) sits on `hearo.barelybooting.com` and routes requests for health, audio, and JSON manifests.
2. **Cloudflare R2** holds the audio files under bucket `hearo-catalog`. Files are addressed by `tracks/<collection>/<id>.<ext>`.
3. **GitHub** is the source of truth for the catalog JSON. The Worker fetches manifest files from `raw.githubusercontent.com` with edge caching, so updating the catalog is just a git push.

The service speaks plain HTTP only. Hearo runs on DOS using the mTCP networking stack, which cannot do TLS, so the Worker deliberately omits `Strict-Transport-Security` from every response.

## Browsing the catalog

```
curl http://hearo.barelybooting.com/health
curl http://hearo.barelybooting.com/
curl http://hearo.barelybooting.com/catalog/index.json
curl http://hearo.barelybooting.com/catalog/collections/showcase.json
curl http://hearo.barelybooting.com/schema/track.json
curl -O http://hearo.barelybooting.com/tracks/showcase/example.mod
```

The root path returns the catalog index, the same as `/catalog/index.json`.

## Deployment

Pushes to `main` that touch `worker/`, `wrangler.toml`, or `package.json` trigger a GitHub Actions workflow that runs `wrangler deploy` against Cloudflare. Two secrets are required on the repo:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Catalog content changes (anything under `catalog/`) do not redeploy the Worker. The Worker fetches them on demand from GitHub raw with a 300 second edge cache, so updates propagate within a few minutes of a push.

## Where audio files live

Audio files are not stored in this repository. They live in Cloudflare R2 under bucket `hearo-catalog`, keyed as `tracks/<collection>/<id>.<ext>`. The repository holds only the metadata that describes them. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full track addition flow.

## Related project

- Hearo player: https://github.com/barelybooting/hearo (placeholder)

## Curatorial philosophy

The catalog is intentionally small and opinionated. It celebrates vintage PC hardware: PC speaker compositions that sing on an 8088, AdLib and OPL3 showcases, Sound Blaster classics, and Gravis Ultrasound tracker modules that put hardware mixing to work. Every track is chosen for a reason, every license is explicit, and every entry tells you what hardware will make it sing.

## How we handle rights

Hearo Catalog is a curated index, not a free-for-all. Every track in the catalog falls into one of three hosting tiers:

- **Host.** Demoscene tracker modules and other works released into the scene under freely-distributable terms or long-standing community norms. We host these on R2 with documented attribution and a clear permission basis.
- **Linkout.** Game music rips and works with fragmented or active rights situations. The catalog metadata exists for discoverability; the audio lives on Internet Archive or another established archive.
- **Bandcamp.** Commercial releases by living artists. We never host these. The catalog entry credits the work and links to the artist's storefront, with the artist's explicit permission.

Every track entry credits the artist by handle and (where the artist has themselves published it) real name, group affiliation, year, original release context, and provenance source. We honor takedown and removal requests promptly via either an informal email path or formal DMCA notice. The full policy is in [COPYRIGHT.md](COPYRIGHT.md); the takedown procedure is in [TAKEDOWN.md](TAKEDOWN.md). The catalog operator is a US Copyright Office registered DMCA designated agent (DMCA-1072235).

## License

Code in this repository is MIT licensed. See [LICENSE.md](LICENSE.md). Audio files have their own per-track licenses, recorded in catalog metadata; the MIT license here does not extend to the music.
