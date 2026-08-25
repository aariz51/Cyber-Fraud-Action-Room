# Golden Hour V2

Golden Hour V2 is a separate, premium multi-page version of the Cyber Fraud Action Room hackathon project. The public landing page is a concise product entry point; urgent guidance and case functionality live inside the dedicated `/action-room` application.

## Included workflows

- Four-question cyber-fraud triage
- Prioritized first-hour action room
- English and Hindi 1930 call script
- Illustrative money-layer map and recovery clock
- Local evidence checklist
- OpenAI-assisted complaint chronology with deterministic fallback
- Written bank-notice draft
- Local action and recovery-stage tracking
- Frozen-account diagnostic, bank letter, and RTI draft
- Real-vs-simulated methodology and primary-source links
- Compatibility redirects from `/act`, `/case`, `/frozen`, and `/how-it-works`

## Privacy and model boundary

Case data is stored in browser local storage. The OpenAI key remains server-side. Only the narrative and minimal incident context are sent when a user explicitly asks for a complaint draft. Urgent routing and legal branches are deterministic.

The server accepts either `OPENAI_API_KEY` or the existing local `OPENAI_KEY` environment variable. Never prefix either variable with `NEXT_PUBLIC_`.

## Run locally

```bash
npm ci
npm run dev
```

For a production verification:

```bash
npm run build
npm run start -- -p 3010
npm run test:smoke
```

The smoke test covers desktop and mobile rendering, triage, local persistence, Hindi call guidance, evidence, OpenAI drafting, recovery tracking, frozen-account outputs, and legacy-route redirects.
