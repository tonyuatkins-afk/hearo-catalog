#!/usr/bin/env node
// Validates catalog JSON against schemas and checks collection-level invariants
// that JSON Schema cannot express cleanly (track ID uniqueness within a collection).

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const repoRoot = path.resolve(__dirname, '..');
const schemaDir = path.join(repoRoot, 'schema');
const catalogDir = path.join(repoRoot, 'catalog');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadSchema(name) {
  return loadJson(path.join(schemaDir, name));
}

const trackSchema = loadSchema('track.json');
const collectionSchema = loadSchema('collection.json');
const manifestSchema = loadSchema('manifest.json');

const validateTrack = ajv.compile(trackSchema);
const validateCollection = ajv.compile(collectionSchema);
const validateManifest = ajv.compile(manifestSchema);

let errors = 0;

function reportErrors(label, validator) {
  if (validator.errors) {
    console.error(`\nValidation errors in ${label}:`);
    for (const err of validator.errors) {
      console.error(`  ${err.instancePath || '(root)'}: ${err.message}`);
    }
    errors++;
  }
}

// Validate manifest
const manifestPath = path.join(catalogDir, 'index.json');
if (fs.existsSync(manifestPath)) {
  const manifest = loadJson(manifestPath);
  if (!validateManifest(manifest)) {
    reportErrors('catalog/index.json', validateManifest);
  } else {
    console.log('OK  catalog/index.json');
  }
}

// Validate every collection and check track ID uniqueness
const collectionsDir = path.join(catalogDir, 'collections');
if (fs.existsSync(collectionsDir)) {
  for (const file of fs.readdirSync(collectionsDir)) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(collectionsDir, file);
    const collection = loadJson(filePath);

    if (!validateCollection(collection)) {
      reportErrors(`catalog/collections/${file}`, validateCollection);
      continue;
    }

    // Check each track individually
    let trackErrors = false;
    for (let i = 0; i < (collection.tracks || []).length; i++) {
      const track = collection.tracks[i];
      if (!validateTrack(track)) {
        console.error(`\nValidation errors in catalog/collections/${file} track[${i}] (id: ${track.id || '(missing)'})`);
        for (const err of validateTrack.errors) {
          console.error(`  ${err.instancePath || '(root)'}: ${err.message}`);
        }
        trackErrors = true;
        errors++;
      }
    }

    // Check track ID uniqueness within the collection
    const ids = (collection.tracks || []).map(t => t.id).filter(Boolean);
    const seen = new Set();
    const dupes = new Set();
    for (const id of ids) {
      if (seen.has(id)) dupes.add(id);
      seen.add(id);
    }
    if (dupes.size > 0) {
      console.error(`\nDuplicate track IDs in catalog/collections/${file}:`);
      for (const id of dupes) console.error(`  ${id}`);
      errors++;
      trackErrors = true;
    }

    if (!trackErrors) {
      console.log(`OK  catalog/collections/${file} (${(collection.tracks || []).length} tracks)`);
    }
  }
}

if (errors > 0) {
  console.error(`\nValidation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('\nAll validation passed.');
  process.exit(0);
}
