# Creative workflow: inputs, skills, and outputs

The product UI presents four broad areas—**Storyboard, Cast, Shots, Edit & Export**. Inside those areas, the implemented production sequence has seven meaningful handoffs. This is a description of the current code path, not a claim that every provider path passed the same recent cloud smoke test.

| Stage | Creator action and input | Implementation capability | Output and dependency |
|---|---|---|---|
| 1. Script intake | Paste or import `.txt`/`.md`, then explicitly save or parse | Browser editor; FastAPI project state and revision checks | Editable script. Import alone does not start inference. |
| 2. Structured storyboard | Parse, inspect, and edit cast, scenes, shots, and timed beats | Azure AI Foundry text path; typed parse schemas; conversion into editable project records; storyboard versioning | Storyboard and cast. Reparse/edit can invalidate affected downstream media. |
| 3. Visual references | Generate/import character portraits and scene anchors; import voice references if desired | GPT Image 2 integration; asset-version records; audio normalization on import | Character and scene reference versions; optional imported voice files. There is no configured voice-generation provider. |
| 4. First frames | Generate/import a first frame for a shot | Reference-conditioned image pipeline; checks for current scene anchor and every required character reference | Versioned shot image linked to storyboard/anchor inputs. |
| 5. H3 motion | Generate/import motion for a shot | Duration validation; first-frame dependency; Vast GPU and ComfyUI H3 adapter; remote execution and transfer | Versioned H3 MP4 linked to the first-frame version. |
| 6. Optional SeedVR2 | Enhance the current H3 clip, or retain the original | Separate remote GPU enhancement adapter with source-video lineage | Optional enhanced MP4 version. |
| 7. Edit and export | Choose the exact H3 or enhanced version for each shot, optionally trim, preview, and export | Selected-version state; trim derivatives; FFmpeg normalization and deterministic concatenation | Final MP4 in storyboard order; unselected shots are omitted. |

## Why the handoffs matter

- **Human control:** Parsing is explicit, and the storyboard remains editable rather than being a one-shot prompt-to-video chain.
- **Visual continuity:** Character and scene references precede the first frame; the first frame precedes motion. Missing dependencies are visible errors, not silent substitutions.
- **Version lineage:** A new visual or motion result is a new version. Input changes mark affected outputs stale while preserving prior versions for comparison and recovery.
- **Asynchronous execution:** Parsing, image, and video work enters durable jobs so a browser request does not own a long-running provider call.
- **Deterministic final assembly:** The editor chooses exact clip versions. FFmpeg produces the export from that selection, rather than asking a model to decide the final timeline.

## Evidence and limits

This map was reconstructed from the source workspace's stage enum, browser views, job executor targets, real pipeline, generation state invalidation rules, and composer. The most recent documented controlled Azure smoke run exercised Foundry parsing and character/scene/first-frame images. Video, enhancement, and voice generation were excluded from that run; voice generation is explicitly disabled in the current executor. The repository documents earlier H3 and SeedVR adapter work but does not supply a fresh public benchmark or customer production claim.

The private source contains generation instructions and provider-specific parameters that are deliberately omitted here. The public account describes dependencies and technical skills without disclosing quality-determining prompt rules.
