# Hearo Catalog Copyright Policy

Last updated: 2026-05-02

## Summary

Hearo Catalog is a curated index of vintage computer music. We host a portion of the catalog directly, link out to other archives for some entries, and link to artist storefronts for commercial releases. Every entry documents how we have the right to list it. We honor takedown requests promptly. If you are an artist or rightsholder and want a change made, see TAKEDOWN.md.

## How the catalog is structured

Every track in the catalog falls into one of three hosting tiers, recorded in the `tier` field of the track manifest:

**host.** The audio file lives on Cloudflare R2 at `tracks/<collection>/<id>.<ext>` and is served by the Hearo Worker. We host a track only when we can establish a clear basis for redistribution: an embedded freely-distributable declaration in the original file, an artist-published statement permitting redistribution, an explicit per-artist grant, public domain or Creative Commons status, or the long-standing community norm covering demoscene party releases.

**linkout.** The catalog entry exists for discoverability and metadata, but the audio itself lives on Internet Archive, Modland, The Mod Archive, AMP, scene.org, or another established archive. The `file` field is empty and `external_links` carries the canonical URL. Linking to a publicly accessible URL does not implicate copying rights, so linkout entries do not require an independent permission basis on our side; the external archive's own rights position governs. We use this tier for game music rips, for works where rights are fragmented or active enforcement posture is uncertain, and for tracker modules whose authors cannot be reached and whose works lack documented party-release pedigree.

**bandcamp.** The work is a commercial release by a living, currently-active artist. We never host these. The catalog entry credits the work, describes it, and provides a direct link to the artist's storefront, typically Bandcamp. Inclusion requires explicit per-artist permission, recorded in the manifest's `permission_record` field.

## Permission basis values

The `permission_basis` field is required on `host` tier entries and forbidden on `linkout` and `bandcamp` entries. It records how we have the right to host the audio. The defined values are:

- **embedded_freely_distributable.** The original tracker file contains a comments-section declaration such as "freely distributable", "PD", "freeware", or equivalent, naming the work or its author. These statements are treated as evidence of an author-granted non-exclusive license to redistribute, consistent with three decades of community practice.
- **artist_published_permission.** The artist has published a statement in a public place permitting redistribution. The canonical example is Skaven's statement at futurecrew.com/skaven/tracker_music.shtml: "All the songs on this page are freeware unless otherwise specified. They may be freely distributed in unmodified form for personal enjoyment." The `license` field cites the specific source.
- **artist_explicit_permission.** The artist has granted permission directly to Hearo Catalog by email or message. The `permission_record` field documents the date, channel, scope, and reference.
- **community_norm_party_release.** The work was released at a demoscene party (Assembly, The Party, Revision, etc.) or in a scene musicdisk and is mirrored without objection on at least two of Modland, The Mod Archive, AMP, scene.org, or demozoo. We rely on the long-standing community understanding that party releases are freely shared while attribution is preserved.
- **public_domain.** The work is in the public domain by age, by author dedication, or by the operation of law in the relevant jurisdiction.
- **creative_commons.** The work is released under a Creative Commons license. The specific license is recorded in the `license` field.

For `linkout` entries, no permission basis is recorded because linking to a publicly accessible URL does not implicate copying rights.

For `bandcamp` entries, the rights story is carried by the `tier` field plus the `permission_record` object, which documents the artist's explicit agreement to catalog inclusion plus linkout.

## What we credit

Every track entry includes:

- The artist's display name (`artist`), which is the handle for tracker artists and the real name for artists who publish under their real name
- The artist's real name (`artist_real_name`), but only when the artist has themselves published it. We do not deanonymize pseudonymous artists.
- Group affiliation at time of release (`artist_group`)
- Year (`year`) and original release context (`original_release_context`)
- Provenance source (`provenance_source`), the canonical archive or release point we sourced the work from

We do not modify the original audio files. Tracker modules are distributed as their original `.mod`, `.s3m`, `.xm`, `.it`, or other format files, byte-identical to the source.

## DMCA designated agent

Hearo Catalog has a US Copyright Office registered DMCA designated agent.

- Service Provider: Hearo Catalog
- Registration Number: DMCA-1072235
- Designated Agent: Tony Atkins
- Public directory listing: https://dmca.copyright.gov/list.html (search "Hearo Catalog")

To submit a takedown notice or an informal removal request, see TAKEDOWN.md.

## Repeat-infringer policy

Hearo Catalog is operator-curated and does not accept user uploads, so the conventional repeat-infringer policy is not directly applicable. As an operational matter, we will not re-list any track that has been removed via valid takedown or honored informal removal request, unless the original rightsholder explicitly grants permission to re-list.

## Rights honesty

Some of the works in the catalog are formally copyrighted by their authors and have been distributed on the basis of community norms rather than formal licenses. We acknowledge this honestly. The community norms we rely on (the demoscene's long-standing understanding that party releases and freely-distributable tracker modules are shared archivally) have governed Modland, The Mod Archive, AMP, scene.org, and HVSC for over twenty-five years on the basis of artist-respecting practice and prompt removal. The catalog is non-commercial; we do not monetize, advertise against, or paywall any work. We mirror the community's posture, document our practice in this file, and stand ready to honor any artist's wishes promptly.

## Changes to this policy

Material changes to this policy will be reflected in the `Last updated` date at the top of this file and in the catalog manifest's policy block. Substantive changes (new permission basis values, changes to tier definitions, changes to the takedown process) will be summarized in commit messages and CHANGELOG entries.
