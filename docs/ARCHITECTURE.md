# System architecture and request lifecycle

This document describes the implemented architecture visible in the `v1_4_0` workspace as reviewed on 2026-09-28. The customer scenario below is an assumption, not an actual customer claim.

## Customer deployment brief (assumptions)

The plausible first customer is a 20–50 person short-video studio. Creators revise scripts and storyboards, generate multiple image and video candidates, review versions, and export approved clips. A lost render wastes paid inference and production time; a wrong or stale asset in a final export can create a client delivery failure. The studio likely has an identity provider, existing creative files, and a review workflow that Illustory must coexist with. Exact request volume, concurrency, latency, budget, data classification, and geographic requirements are unknown and must be agreed with a real customer.

## Implemented layers

1. **Experience:** browser views for script, storyboard, cast, scenes, shots, job activity, trim, and export.
2. **API:** FastAPI validates identity, resolves active workspace membership and role, enforces project revision checks, and exposes project, job, asset, and operation endpoints.
3. **State:** PostgreSQL owns users, workspaces, memberships, project documents, durable generation jobs and attempts, asset versions, and audit records. The editable storyboard is held in the project record; relational rows track asset provenance.
4. **Execution:** a separate worker claims eligible PostgreSQL jobs with a time-limited lease, renews it, runs provider adapters, records attempt outcomes, and bounds retries.
5. **AI and media:** Azure AI Foundry handles structured text parsing in the documented cloud path. Image generation and remote GPU video/enhancement are adapter-backed. FFmpeg performs deterministic media normalization and final assembly.
6. **Storage and delivery:** private Blob Storage holds binary media. The API authorizes access before returning a private stream or short-lived delivery capability. A local filesystem adapter exists for development.
7. **Azure runtime:** API and worker run as separate Container Apps from a private Container Registry image. Separate managed identities have scoped access to Key Vault and Blob. Log Analytics receives platform logs.

## Generate and publish a shot

```mermaid
sequenceDiagram
    autonumber
    actor Creator
    participant Browser
    participant API as FastAPI
    participant DB as PostgreSQL
    participant Worker
    participant Provider as AI/GPU adapter
    participant Blob as Private Blob
    Creator->>Browser: Request a shot asset
    Browser->>API: Authenticated job request + idempotency key
    API->>DB: Check membership, role, revision; insert job + input snapshot
    API-->>Browser: 202 + durable job ID
    Worker->>DB: Claim eligible job with lease
    Worker->>Provider: Generate from pinned input
    Provider-->>Worker: Output or failure
    Worker->>Blob: Upload candidate output
    Worker->>Blob: Verify existence and metadata
    Worker->>DB: Publish version iff lease and revision remain valid
    Browser->>API: Read job/project state
    API->>DB: Recheck membership and current version
    API-->>Browser: Job state + authorized media delivery
```

Provider errors become recorded failed attempts with bounded retry behavior. A cancelled job or lost lease cannot make an output current. A changed creative input can leave earlier output as history without presenting it as the new current asset.

## Trust boundaries

| Boundary | Enforcement point |
|---|---|
| Browser to API | Entra token validation and server-side workspace membership/role lookup |
| API to state | Project revision and idempotency rules in transactional repository operations |
| Worker to provider | Server-side adapter and credentials; provider responses treated as untrusted outputs |
| Worker to Blob and DB | Object verification before relational publication; lease and revision checks |
| Browser to media | Project authorization before private delivery; no direct public container |
| Workload to Azure | Separate managed identities and scoped Key Vault/Blob rights |

## State and failure behavior

The job states are `queued`, `running`, `succeeded`, `failed`, and `cancelled`. PostgreSQL is the current job queue and source of truth. A request returns quickly while generation proceeds out of band. Attempts, errors, timings, and correlation data support investigation. Versioned assets avoid destructive overwrite. The API and worker are separate runtime processes so a browser timeout does not own generation progress.

## Current deployment boundary

The Azure deployment is a development environment. The documented pilot gates require cross-workspace authorization evidence, durable terminal job states, stale-result prevention, verified object provenance, representative human quality review, cost policy, recovery exercise, and operational alerting. No customer production SLO or scale claim is asserted here because the source materials do not establish one.
