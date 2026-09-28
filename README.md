# Illustory.ai — architecture showcase

Illustory takes a script through an editable production workflow: storyboard, cast and scene references, shot first frames, generated motion, optional enhancement, and final export. This repository is a **sanitized technical showcase and fictional interactive walkthrough** of the current `v1_4_0` workspace. It is not the application source, an API client, or a customer production deployment.

**Live demo:** [Explore the public architecture walkthrough](https://susunbourne.github.io/Illustory.ai-demo/). The `dist/` directory can also be served as a static website.

## Creative workflow and engineering skills

```mermaid
flowchart LR
    A[Editable script<br/>paste or .txt/.md import] --> B[Structured storyboard<br/>cast, scenes, shots, timed beats]
    B --> C[Character references<br/>and scene anchors]
    C --> D[Shot first frames]
    D --> E[H3 motion clips]
    E --> F{Enhance?}
    F -->|optional| G[SeedVR2 version]
    F -->|keep original| H[Select + trim]
    G --> H
    H --> I[FFmpeg final export<br/>storyboard order]
```

| Creative stage | Concrete output | Engineering work |
|---|---|---|
| Script and storyboard | Editable script, typed cast/scenes/shots/beats | Text import, Azure AI Foundry parsing, typed schemas, revision tracking |
| Visual continuity | Character references and scene anchors | GPT Image 2 integration, imported voice normalization, versioned asset lineage |
| Shot image | First frame for each shot | Reference dependency checks and image generation |
| Motion and enhancement | H3 clip; optional SeedVR2 version | Vast GPU orchestration, ComfyUI H3 adapter, separate enhancement adapter |
| Edit and delivery | Selected/trimmed clips and final MP4 | Exact asset-version selection and FFmpeg normalization/concatenation |

The creator can edit the storyboard between stages and generate only the needed assets. Each output keeps the input version it came from; changed inputs make dependent results stale without destroying history. **Voice audio is imported; voice generation is not configured.** The H3/SeedVR workflow is implemented, while the cited cloud smoke run covered parsing and images rather than repeating paid GPU jobs. See [workflow details and evidence](docs/WORKFLOW.md).

## System at a glance

```mermaid
flowchart LR
    U[Creator browser] -->|Entra sign-in| A[FastAPI API<br/>Azure Container Apps]
    A -->|Workspace membership + role checks| P[(Azure Database<br/>for PostgreSQL)]
    A -->|Accept job, return durable ID| U
    P -->|Lease eligible job + input snapshot| W[Generation worker<br/>Azure Container Apps]
    W -->|Attempts, heartbeat, final state| P
    W -->|Structured text parsing| F[Azure AI Foundry]
    W -->|Image and remote GPU adapters| G[External AI / GPU providers]
    W -->|Validated media + checksum| B[(Private Azure Blob Storage)]
    A -->|Authorized asset delivery| B
    K[Azure Key Vault] -->|Scoped secret access| A
    K -->|Scoped secret access| W
    I[Separate managed identities] --> A
    I --> W
    R[Private Azure Container Registry] -->|Immutable image digest| A
    R -->|Immutable image digest| W
```

### What each layer owns

| Layer | Public technical detail | Ownership |
|---|---|---|
| Browser | Storyboard, cast, shots, generation activity, edit and export views | User interaction; no provider credentials |
| API and policy | FastAPI, Entra token validation, workspace membership, role checks, revision checks | Synchronous requests and authorization |
| Relational state | PostgreSQL projects, jobs, attempts, asset versions, audit events | Transactional source of truth; jobs are also the current queue |
| Worker | Separate process, lease renewal, bounded retry, cancellation and stale-result checks | Long-running provider work |
| AI and media | Azure AI Foundry for structured text parsing; external image and GPU adapters; FFmpeg for composition | Fallible generation and deterministic media assembly |
| Binary storage | Private Azure Blob Storage and local development adapter | Immutable asset bytes; database records carry references and checksums |
| Azure operations | Container Apps, Container Registry, Key Vault, managed identities, Log Analytics | Runtime, artifact, secret and telemetry boundaries |

The AI stages above use a shared generation control path. An endpoint records an idempotent request and returns a job ID. A worker leases the job and records each attempt. On success, it verifies the output and publishes a new asset version only when the lease and input revision are still valid. A failed or stale attempt does not replace the current asset. See [the architecture walkthrough](docs/ARCHITECTURE.md).

## Demo boundary

The website uses hard-coded fictional content. Its buttons demonstrate state transitions in the browser; they do **not** call Illustory APIs, Azure services, model providers, or customer storage. The static site contains no private prompts, credentials, production source code, infrastructure IDs, customer data, or operational URLs. See [publication boundaries](docs/PUBLICATION_BOUNDARY.md).

## Deployment status and evidence

The source workspace documents a deployed **Azure development environment**, not a customer production launch. Its documented evidence includes authorization and worker tests, cloud smoke checks for parsing and images, immutable container revisions, and asset integrity verification. The documented open gates include a historical media provenance item, representative human quality evaluation, a customer-approved cost policy, backup/restore exercise, and alerting. The exact status may change after this showcase snapshot; this repository intentionally does not mirror private operational telemetry.

## Run locally

Serve `dist/` with any static HTTP server, for example:

```sh
python -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. No environment variables, account, build step, or backend are required.

## Repository scope

This repository contains only the public presentation. The production application, private prompt and generation rules, IaC, deployment scripts, data, and tests remain in the private workspace. No license is granted for those private materials.
