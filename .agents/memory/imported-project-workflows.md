---
name: Imported artifact workflows
description: Workflow registration behavior for imported artifact monorepos
---

Imported artifact projects may initially have artifact metadata on disk but no registered managed workflows. Temporary workflows can be needed only until artifact registration completes; once managed services appear, remove duplicate temporary workflow definitions and use the managed names.

**Why:** Starting an imported project before artifact registration can produce “workflow does not exist” errors, while leaving both temporary and managed services creates confusing duplicate processes.

**How to apply:** Check the workflow inventory after setup. Prefer `artifacts/<slug>: <service>` workflows once present, and keep `.replit` free of duplicate per-service workflow entries.