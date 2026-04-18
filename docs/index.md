---
title: Documentation
description: How Reseam works end to end: the patch engine, the metadata API, and the patch bundles.
---

# Docs

Reseam applies community-built patches to Android apps, on-device. The patched app installs alongside the original; nothing about your apps leaves the phone.

These docs cover the three pieces and how they fit together:

- **Engine**: the Rust patching engine and CLI. Runs on your phone inside Reseam Manager, or on your laptop for authoring and CI.
- **API**: the metadata server at `api.reseam.app`. Serves `patches.json`, `manager.json`, announcements, and redirects to the upstream release host.
- **Patches**: the official bundle. How it's built, how to add a patch, and how to publish your own.

Pick a topic from the sidebar, or browse the sections below.
