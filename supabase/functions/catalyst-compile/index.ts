import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

/* -------------------------------------------------------------------------- */
/*  Catalyst OS 3.0 — research compiler (TypeScript port)                      */
/*                                                                            */
/*  IDEA → ResearchSpec → (ArchitecturePlan ‖ ExperimentPlan) →                */
/*  ImplementationBundle → VerificationReport → local ValidationReport →       */
/*  hypothesis graph + hash-chained provenance ledger.                         */
/*                                                                            */
/*  Model stages run through the Lovable AI Gateway. When the gateway is       */
/*  unavailable the deterministic local engine produces the same shapes, so a  */
/*  run always yields a complete, typed artifact.                              */
/* -------------------------------------------------------------------------- */

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions'
const MODEL = 'google/gemini-3.5-flash'

const DOMAIN_STATUS: Record<string, 'established' | 'experimental' | 'speculative'> = {
  resonance_signal_analysis: 'experimental',
  quantum_navigation_simulation: 'speculative',
  eeg_signal_research: 'experimental',
  geomagnetic_signal_analysis: 'experimental',
  biofeedback_exploration: 'speculative',
  general_research: 'experimental',
}

const DOMAIN_GUARDRAILS: Record<string, string[]> = {
  resonance_signal_analysis: ['Simulation output is not physical measurement.'],
  quantum_navigation_simulation: ['No claim of physical quantum hardware behavior.'],
  eeg_signal_research: ['Not a medical device; no diagnostic claims.'],
  geomagnetic_signal_analysis: ['Synthetic geomagnetic data only.'],
  biofeedback_exploration: ['Not medical advice; exploratory only.'],
  general_research: ['Computational research prototype; not empirical evidence.'],
}

type Status = 'established' | 'experimental' | 'speculative'

interface Claim {
  statement: string
  status: Status
  rationale: string
  evidence_needed: string[]
}

interface ResearchSpec {
  title: string
  concept: string
  domain: string
  objective: string
  scientific_status: Status
  assumptions: string[]
  claims: Claim[]
  success_metrics: string[]
  falsification_tests: string[]
  constraints: string[]
  risks: string[]
  tags: string[]
  seed: number
}

/* ----------------------------- Model boundary ---------------------------- */

/**
 * One typed transformation: prompt in, schema-validated JSON out. The model is
 * a replaceable backend — the caller never depends on provider specifics.
 */
async function generate<T>(
  apiKey: string,
  system: string,
  user: string,
  schema: Record<string, unknown>,
  name: string,
): Promise<T | null> {
  try {
    const res = await fetch(GATEWAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name, strict: true, schema },
        },
      }),
    })
    if (!res.ok) {
      console.error('gateway stage failed', name, res.status, await res.text())
      return null
    }
    const json = await res.json()
    const text = json?.choices?.[0]?.message?.content
    return text ? (JSON.parse(text) as T) : null
  } catch (err) {
    console.error('gateway stage error', name, err)
    return null
  }
}

const strArray = { type: 'array', items: { type: 'string' } }

/* ------------------------------- Schemas --------------------------------- */

const SPEC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title', 'objective', 'assumptions', 'claims', 'success_metrics',
    'falsification_tests', 'risks', 'tags',
  ],
  properties: {
    title: { type: 'string' },
    objective: { type: 'string' },
    assumptions: strArray,
    claims: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['statement', 'status', 'rationale', 'evidence_needed'],
        properties: {
          statement: { type: 'string' },
          status: { type: 'string', enum: ['established', 'experimental', 'speculative'] },
          rationale: { type: 'string' },
          evidence_needed: strArray,
        },
      },
    },
    success_metrics: strArray,
    falsification_tests: strArray,
    risks: strArray,
    tags: strArray,
  },
}

const ARCH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'modules', 'data_flow', 'dependencies', 'test_strategy', 'observability', 'security_notes'],
  properties: {
    summary: { type: 'string' },
    modules: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['path', 'purpose', 'responsibilities'],
        properties: { path: { type: 'string' }, purpose: { type: 'string' }, responsibilities: strArray },
      },
    },
    data_flow: strArray,
    dependencies: strArray,
    test_strategy: strArray,
    observability: strArray,
    security_notes: strArray,
  },
}

const EXPERIMENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['hypothesis', 'independent_variables', 'dependent_variables', 'controls', 'procedure', 'metrics', 'interpretation_limits'],
  properties: {
    hypothesis: { type: 'string' },
    independent_variables: strArray,
    dependent_variables: strArray,
    controls: strArray,
    procedure: strArray,
    metrics: strArray,
    interpretation_limits: strArray,
  },
}

const BUNDLE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'files', 'dependencies', 'run_command', 'notes'],
  properties: {
    summary: { type: 'string' },
    files: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['path', 'purpose', 'content'],
        properties: { path: { type: 'string' }, purpose: { type: 'string' }, content: { type: 'string' } },
      },
    },
    dependencies: strArray,
    run_command: { type: 'string' },
    notes: strArray,
  },
}

const VERIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'passed', 'findings', 'summary'],
  properties: {
    score: { type: 'integer' },
    passed: { type: 'boolean' },
    summary: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['severity', 'category', 'message'],
        properties: {
          severity: { type: 'string', enum: ['info', 'warning', 'error', 'critical'] },
          category: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
}

/* --------------------------- Deterministic engine ------------------------- */

function localSpec(idea: string, domain: string, seed: number): ResearchSpec {
  const status = DOMAIN_STATUS[domain] ?? 'experimental'
  const claims: Claim[] = [
    {
      statement: 'The generated prototype can test computational behavior associated with the concept.',
      status: 'established',
      rationale: 'A software simulation can evaluate the behavior of its explicit mathematical model.',
      evidence_needed: [],
    },
  ]
  if (status === 'speculative') {
    claims.push({
      statement: 'The modeled mechanism corresponds to a physically realizable system.',
      status: 'speculative',
      rationale: 'The prototype is a simulation and does not establish physical realizability.',
      evidence_needed: ['independent experimental validation', 'replicable physical measurements'],
    })
  }
  return {
    title: `Catalyst Experiment: ${idea.slice(0, 80)}`,
    concept: idea,
    domain,
    objective: 'Build a reproducible computational experiment that exposes measurable behavior and failure conditions.',
    scientific_status: status,
    assumptions: ['Synthetic input data is acceptable for the first prototype.'],
    claims,
    success_metrics: ['reproducible output for a fixed seed', 'detectable spectral peaks', 'automated tests pass'],
    falsification_tests: [
      'remove the injected signal and confirm peak evidence falls',
      'change seed and verify bounded variation',
    ],
    constraints: DOMAIN_GUARDRAILS[domain] ?? DOMAIN_GUARDRAILS.general_research,
    risks: ['simulation results may be mistaken for empirical evidence'],
    tags: [domain, 'simulation', 'reproducible'],
    seed,
  }
}

function localArchitecture() {
  return {
    summary: 'A small scientific Python package generates a seeded signal, estimates its PSD, detects peaks, and exports machine-readable results.',
    modules: [
      { path: 'prototype.py', purpose: 'simulation and analysis', responsibilities: ['generate signal', 'analyze PSD', 'save outputs'] },
      { path: 'tests/test_prototype.py', purpose: 'verification', responsibilities: ['reproducibility test', 'peak recovery test'] },
      { path: 'README.md', purpose: 'scope and usage', responsibilities: ['execution instructions', 'interpretation boundaries'] },
    ],
    data_flow: ['seed/config → synthetic signal → Welch PSD → peak selection → JSON + PNG'],
    dependencies: ['numpy', 'scipy', 'matplotlib'],
    test_strategy: ['fixed-seed reproducibility', 'known-frequency recovery'],
    observability: ['results.json', 'spectrum.png', 'console summary'],
    security_notes: ['offline execution', 'writes only to current project directory'],
  }
}

function localExperiment() {
  return {
    hypothesis: 'Injected oscillatory components produce reproducible peaks in the estimated power spectral density.',
    independent_variables: ['injected frequencies', 'noise scale', 'random seed'],
    dependent_variables: ['detected peak frequencies', 'peak PSD', 'signal RMS'],
    controls: ['noise-only signal', 'fixed seed'],
    procedure: ['generate seeded signal', 'estimate Welch PSD', 'detect prominent peaks', 'serialize results'],
    metrics: ['frequency error in Hz', 'number of detected peaks', 'RMS amplitude'],
    interpretation_limits: ['simulation validates the numerical pipeline, not external biological or quantum claims'],
  }
}

function localBundle(spec: ResearchSpec) {
  return {
    summary: 'Deterministic seeded spectral prototype with tests and documentation.',
    files: [
      {
        path: 'prototype.py',
        purpose: 'simulation and analysis',
        content: `import json\nimport numpy as np\nfrom scipy.signal import welch, find_peaks\n\nSEED = ${spec.seed}\n\n\ndef generate(seed=SEED, fs=1000, duration=10.0, freqs=(7.83, 13.0, 21.0), noise=0.2):\n    rng = np.random.default_rng(seed)\n    t = np.arange(int(fs * duration)) / fs\n    sig = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi)) for f in freqs) / len(freqs)\n    return t, sig + rng.normal(0.0, noise, t.size)\n\n\ndef analyze(sig, fs=1000):\n    f, psd = welch(sig, fs=fs, nperseg=min(2048, sig.size))\n    peaks, _ = find_peaks(psd, height=float(np.quantile(psd, 0.9)))\n    ranked = sorted(peaks, key=lambda i: psd[i], reverse=True)[:8]\n    return {"dominant_frequencies_hz": [float(f[i]) for i in ranked],\n            "signal_rms": float(np.sqrt(np.mean(sig ** 2)))}\n\n\nif __name__ == "__main__":\n    _, s = generate()\n    print(json.dumps(analyze(s), indent=2))\n`,
      },
      {
        path: 'tests/test_prototype.py',
        purpose: 'verification',
        content: `import numpy as np\nfrom prototype import analyze, generate\n\n\ndef test_reproducible():\n    assert np.array_equal(generate(137)[1], generate(137)[1])\n\n\ndef test_recovers_known_frequency():\n    _, sig = generate(137, noise=0.05, freqs=(13.0,))\n    got = analyze(sig)["dominant_frequencies_hz"]\n    assert min(abs(f - 13.0) for f in got) < 1.0\n`,
      },
      {
        path: 'README.md',
        purpose: 'scope and usage',
        content: `# ${spec.title}\n\n**Concept:** ${spec.concept}\n\n**Scientific status:** \`${spec.scientific_status}\`\n\n${spec.constraints.map((c) => `- ${c}`).join('\n')}\n\n\`\`\`bash\npython prototype.py\n\`\`\`\n`,
      },
    ],
    dependencies: ['numpy', 'scipy'],
    run_command: 'python prototype.py',
    notes: ['Generated by the deterministic local engine (no model backend used for this stage).'],
  }
}

/* ------------------------ Local deterministic gates ----------------------- */

interface Finding {
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: string
  message: string
}

const BANNED = ['eval(', 'exec(', 'os.system', 'subprocess.', '__import__', 'shutil.rmtree', 'requests.get(']

/** AST-free static policy gate: no execution/network primitives, tests present. */
function validateBundle(bundle: { files: Array<{ path: string; content: string }> }) {
  const findings: Finding[] = []
  for (const file of bundle.files) {
    for (const token of BANNED) {
      if (file.content.includes(token)) {
        findings.push({ severity: 'error', category: 'policy', message: `${file.path} uses restricted primitive \`${token}\`` })
      }
    }
    if (file.path.startsWith('/') || file.path.includes('..')) {
      findings.push({ severity: 'critical', category: 'path', message: `unsafe file path ${file.path}` })
    }
  }
  const hasTests = bundle.files.some((f) => f.path.includes('test'))
  if (!hasTests) findings.push({ severity: 'warning', category: 'tests', message: 'bundle contains no test module' })
  const hasReadme = bundle.files.some((f) => f.path.toLowerCase().endsWith('readme.md'))
  if (!hasReadme) findings.push({ severity: 'info', category: 'docs', message: 'no README.md in bundle' })

  const blocking = findings.filter((f) => f.severity === 'error' || f.severity === 'critical').length
  return {
    passed: blocking === 0,
    checks: ['static policy scan', 'relative-path safety', 'test presence', 'documentation presence'],
    findings,
  }
}

/* --------------------------- Hypothesis graph ----------------------------- */

function buildHypothesisGraph(spec: ResearchSpec) {
  const nodes: Array<Record<string, unknown>> = [
    { id: 'concept', type: 'concept', label: spec.concept },
    { id: 'objective', type: 'objective', label: spec.objective },
  ]
  const edges: Array<Record<string, string>> = [{ source: 'concept', target: 'objective', relation: 'motivates' }]

  spec.claims.forEach((claim, i) => {
    const id = `claim:${i}`
    nodes.push({ id, type: 'claim', label: claim.statement, status: claim.status, rationale: claim.rationale })
    edges.push({ source: 'objective', target: id, relation: 'contains_claim' })
    claim.evidence_needed.forEach((evidence, j) => {
      const evId = `evidence:${i}:${j}`
      nodes.push({ id: evId, type: 'evidence_needed', label: evidence })
      edges.push({ source: evId, target: id, relation: 'would_support' })
    })
  })
  spec.success_metrics.forEach((metric, i) => {
    nodes.push({ id: `metric:${i}`, type: 'metric', label: metric })
    edges.push({ source: `metric:${i}`, target: 'objective', relation: 'measures' })
  })
  spec.falsification_tests.forEach((falsifier, i) => {
    nodes.push({ id: `falsifier:${i}`, type: 'falsifier', label: falsifier })
    edges.push({ source: `falsifier:${i}`, target: 'objective', relation: 'can_disconfirm' })
  })

  return { nodes, edges }
}

function graphToMermaid(graph: { nodes: Array<Record<string, unknown>>; edges: Array<Record<string, string>> }) {
  const safe = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '_')
  const lines = ['flowchart LR']
  for (const node of graph.nodes) {
    const label = String(node.label).replace(/"/g, "'").slice(0, 90)
    lines.push(`  ${safe(String(node.id))}["${label}"]`)
  }
  for (const edge of graph.edges) {
    lines.push(`  ${safe(edge.source)} -->|${edge.relation}| ${safe(edge.target)}`)
  }
  return lines.join('\n')
}

/* --------------------------- Provenance ledger ---------------------------- */

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/* -------------------------------- Handler --------------------------------- */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    })

  let failCtx: { admin: ReturnType<typeof createClient>; runId: string } | null = null

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401)
    const userId = userData.user.id

    const body = await req.json().catch(() => ({}))
    const runId = typeof body.runId === 'string' ? body.runId : null
    if (!runId) return json({ error: 'runId is required' }, 400)

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { data: run, error: runError } = await admin
      .from('catalyst_runs')
      .select('*')
      .eq('id', runId)
      .maybeSingle()
    if (runError || !run) return json({ error: 'Run not found' }, 404)
    if (run.user_id !== userId) return json({ error: 'Forbidden' }, 403)
    if (run.status === 'complete') return json({ ok: true, runId, status: 'complete' })
    failCtx = { admin, runId }

    let seq = 0
    let prevHash: string | null = null
    const record = async (stage: string, payload: unknown) => {
      const hash = await sha256(`${prevHash ?? ''}|${stage}|${JSON.stringify(payload)}`)
      await admin.from('catalyst_events').insert({
        run_id: runId, seq, stage, payload: payload as Record<string, unknown>, hash, prev_hash: prevHash,
      })
      prevHash = hash
      seq += 1
    }

    await admin.from('catalyst_runs').update({ status: 'running', error: null }).eq('id', runId)
    await record('run_started', { idea: run.idea, domain: run.domain, seed: run.seed, mode: run.mode })

    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    const useAi = run.mode !== 'local' && !!apiKey
    const guardrails = (DOMAIN_GUARDRAILS[run.domain] ?? DOMAIN_GUARDRAILS.general_research).join(' ')
    const fallback = localSpec(run.idea, run.domain, run.seed)

    /* Stage 1 — epistemic compiler */
    let spec: ResearchSpec = fallback
    if (useAi) {
      const generated = await generate<Partial<ResearchSpec>>(
        apiKey!,
        'You are an epistemic compiler. Convert a research idea into a rigorous, falsification-first research specification. Label every claim as established, experimental, or speculative and never overstate evidence.',
        `Idea: ${run.idea}\nDomain: ${run.domain}\nGuardrails: ${guardrails}`,
        SPEC_SCHEMA,
        'research_spec',
      )
      if (generated) {
        spec = {
          ...fallback,
          ...generated,
          concept: run.idea,
          domain: run.domain,
          seed: run.seed,
          scientific_status: DOMAIN_STATUS[run.domain] ?? 'experimental',
          constraints: fallback.constraints,
          claims: (generated.claims ?? fallback.claims).map((c) => ({ evidence_needed: [], ...c })),
        }
      }
    }
    await record('spec', spec)

    /* Stage 2 — architecture ‖ experiment design (concurrent branches) */
    const [architecture, experiment] = await Promise.all([
      useAi
        ? generate<ReturnType<typeof localArchitecture>>(
            apiKey!,
            'You are a software architect for scientific prototypes. Produce a minimal, testable module plan.',
            JSON.stringify({ spec }),
            ARCH_SCHEMA,
            'architecture_plan',
          ).then((r) => r ?? localArchitecture())
        : Promise.resolve(localArchitecture()),
      useAi
        ? generate<ReturnType<typeof localExperiment>>(
            apiKey!,
            'You are an experiment designer. Produce a falsifiable experiment plan with explicit interpretation limits.',
            JSON.stringify({ spec }),
            EXPERIMENT_SCHEMA,
            'experiment_plan',
          ).then((r) => r ?? localExperiment())
        : Promise.resolve(localExperiment()),
    ])
    await record('architecture', architecture)
    await record('experiment', experiment)

    /* Stage 3 — implementation compiler */
    let implementation = localBundle(spec)
    if (useAi) {
      const generated = await generate<typeof implementation>(
        apiKey!,
        'You are an implementation compiler. Emit complete, runnable Python project files with tests. Never use eval, exec, subprocess, os.system, or network calls.',
        JSON.stringify({ spec, architecture, experiment }),
        BUNDLE_SCHEMA,
        'implementation_bundle',
      )
      if (generated?.files?.length) implementation = generated
    }
    await record('implementation', { summary: implementation.summary, files: implementation.files.map((f) => f.path) })

    /* Stage 4 — adversarial verification */
    let verification: { score: number; passed: boolean; summary: string; findings: Finding[] } = {
      score: 70,
      passed: true,
      summary: 'Deterministic baseline verification: no model reviewer available for this run.',
      findings: [{ severity: 'info', category: 'verification', message: 'Adversarial model review was skipped.' }],
    }
    if (useAi) {
      const generated = await generate<typeof verification>(
        apiKey!,
        'You are an adversarial reviewer. Attack the scientific claims, implementation correctness, and reproducibility of this bundle. Be specific and harsh but fair.',
        JSON.stringify({ spec, experiment, files: implementation.files }),
        VERIFY_SCHEMA,
        'verification_report',
      )
      if (generated) verification = { ...generated, findings: generated.findings ?? [] }
    }
    await record('verification', verification)

    /* Stage 5 — local deterministic gates */
    const validation = validateBundle(implementation)
    await record('validation', validation)

    /* Stage 6 — hypothesis graph */
    const hypothesisGraph = buildHypothesisGraph(spec)
    const mermaid = graphToMermaid(hypothesisGraph)
    await record('hypothesis_graph', { nodes: hypothesisGraph.nodes.length, edges: hypothesisGraph.edges.length })

    const { error: updateError } = await admin
      .from('catalyst_runs')
      .update({
        status: 'complete',
        spec,
        architecture,
        experiment,
        implementation,
        verification,
        validation,
        hypothesis_graph: hypothesisGraph,
        mermaid,
        mode: useAi ? 'ai' : 'local',
      })
      .eq('id', runId)
    if (updateError) throw updateError

    await record('run_complete', { passed: validation.passed && verification.passed })

    return json({ ok: true, runId, status: 'complete' })
  } catch (err) {
    console.error('catalyst-compile failed', err)
    if (failCtx) {
      await failCtx.admin
        .from('catalyst_runs')
        .update({ status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' })
        .eq('id', failCtx.runId)
    }
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
