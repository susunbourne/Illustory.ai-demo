# Publication boundary

This repository is intentionally an explanatory artifact. It contains:

- architecture, technology choices, trust boundaries, and failure behavior;
- an illustrative static UI with fictional project data;
- high-level deployment status and known pilot gates.

It excludes:

- all application source, provider adapters, infrastructure templates, migration and deployment scripts;
- credentials, tokens, secret values, tenant IDs, subscription IDs, resource names, hostnames, firewall rules, and internal endpoints;
- system prompts, generation prompts, prompt templates, ranking or quality rules, model parameters, and private evaluation cases;
- user projects, real media, logs, request traces, internal reports, and customer data.

The public diagrams describe **roles and data flows**, not copy-ready production configuration. Provider names and Azure product names are disclosed only at the service level. The website has no outbound application requests, analytics, forms, or authentication flow.

Before publishing a later version, review the complete Git tree and history. A `.gitignore` entry is not a substitute for reviewing committed files. Never copy private source into this repository, even temporarily, because deletion from a later commit would leave it in Git history.
