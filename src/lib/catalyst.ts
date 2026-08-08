import { supabase } from '@/integrations/supabase/client';

/* -------------------------------------------------------------------------- */
/*  Catalyst OS types — mirrored from the compiler edge function                */
/* -------------------------------------------------------------------------- */

export type ScientificStatus = 'established' | 'experimental' | 'speculative';

export interface CatalystClaim {
  statement: string;
  status: ScientificStatus;
  rationale?: string;
  evidence_needed?: string[];
}

export interface CatalystSpec {
  title: string;
  concept: string;
  domain: string;
  objective: string;
  scientific_status: ScientificStatus;
  assumptions: string[];
  claims: CatalystClaim[];
  success_metrics: string[];
  falsification_tests: string[];
  constraints: string[];
  risks: string[];
  tags: string[];
  seed: number;
}

export interface CatalystArchitecture {
  summary: string;
  modules: Array<{ path: string; purpose: string; responsibilities: string[] }>;
  data_flow: string[];
  dependencies: string[];
  test_strategy: string[];
  observability: string[];
  security_notes: string[];
}

export interface CatalystExperiment {
  hypothesis: string;
  independent_variables: string[];
  dependent_variables: string[];
  controls: string[];
  procedure: string[];
  metrics: string[];
  interpretation_limits: string[];
}

export interface CatalystBundle {
  summary: string;
  files: Array<{ path: string; purpose: string; content: string }>;
  dependencies: string[];
  run_command: string;
  notes: string[];
}

export interface CatalystFinding {
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  message: string;
}

export interface CatalystVerification {
  score: number;
  passed: boolean;
  summary: string;
  findings: CatalystFinding[];
}

export interface CatalystValidation {
  passed: boolean;
  checks: string[];
  findings: CatalystFinding[];
}

export interface HypothesisGraph {
  nodes: Array<{ id: string; type: string; label: string; status?: ScientificStatus; rationale?: string }>;
  edges: Array<{ source: string; target: string; relation: string }>;
}

export interface CatalystRun {
  id: string;
  user_id: string;
  idea: string;
  domain: string;
  seed: number;
  mode: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  error: string | null;
  spec: CatalystSpec | null;
  architecture: CatalystArchitecture | null;
  experiment: CatalystExperiment | null;
  implementation: CatalystBundle | null;
  verification: CatalystVerification | null;
  validation: CatalystValidation | null;
  hypothesis_graph: HypothesisGraph | null;
  mermaid: string | null;
  project_id: string | null;
  visibility: string;
  created_at: string;
}

export const CATALYST_DOMAINS = [
  { value: 'resonance_signal_analysis', label: 'Resonance signal analysis' },
  { value: 'quantum_navigation_simulation', label: 'Quantum navigation simulation' },
  { value: 'eeg_signal_research', label: 'EEG signal research' },
  { value: 'geomagnetic_signal_analysis', label: 'Geomagnetic signal analysis' },
  { value: 'biofeedback_exploration', label: 'Biofeedback exploration' },
  { value: 'general_research', label: 'General research' },
] as const;

export interface CatalystEvent {
  id: string;
  seq: number;
  stage: string;
  payload: unknown;
  hash: string;
  prev_hash: string | null;
  created_at: string;
}

/* -------------------------------------------------------------------------- */
/*  API                                                                        */
/* -------------------------------------------------------------------------- */

// The generated types file does not yet know about the Catalyst tables.
const db = supabase as unknown as {
  from: (table: string) => any;
};

const mapRun = (row: Record<string, unknown>) => row as unknown as CatalystRun;

export const fetchCatalystRuns = async (userId?: string | null): Promise<CatalystRun[]> => {
  let query = db.from('catalyst_runs').select('*').order('created_at', { ascending: false }).limit(50);
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRun);
};

export const fetchCatalystRun = async (runId: string): Promise<CatalystRun | null> => {
  const { data, error } = await db.from('catalyst_runs').select('*').eq('id', runId).maybeSingle();
  if (error) throw error;
  return data ? mapRun(data) : null;
};

export const fetchCatalystEvents = async (runId: string): Promise<CatalystEvent[]> => {
  const { data, error } = await db
    .from('catalyst_events')
    .select('*')
    .eq('run_id', runId)
    .order('seq', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CatalystEvent[];
};

/**
 * Creates the run row (RLS-scoped to the signed-in user) and asks the backend
 * compiler to execute the pipeline against it.
 */
export const compileCatalystRun = async (
  userId: string,
  input: { idea: string; domain: string; seed: number; visibility?: string },
): Promise<string> => {
  const { data, error } = await db
    .from('catalyst_runs')
    .insert({
      user_id: userId,
      idea: input.idea.trim(),
      domain: input.domain,
      seed: input.seed,
      visibility: input.visibility ?? 'public',
    })
    .select('id')
    .single();
  if (error) throw error;

  const runId = data.id as string;
  const { error: invokeError } = await supabase.functions.invoke('catalyst-compile', { body: { runId } });
  if (invokeError) throw invokeError;
  return runId;
};

export const linkRunToProject = async (runId: string, projectId: string) => {
  const { error } = await db.from('catalyst_runs').update({ project_id: projectId }).eq('id', runId);
  if (error) throw error;
};

/** Renders a completed run as publishable Resona project markdown. */
export const runToProjectContent = (run: CatalystRun): string => {
  const spec = run.spec;
  const exp = run.experiment;
  const lines: string[] = [];

  if (spec) {
    lines.push(`## Objective\n\n${spec.objective}`);
    lines.push(`**Scientific status:** \`${spec.scientific_status}\``);
    if (spec.claims.length) {
      lines.push('## Claims\n');
      spec.claims.forEach((c) => lines.push(`- **[${c.status}]** ${c.statement}`));
    }
    if (spec.falsification_tests.length) {
      lines.push('## Falsification tests\n');
      spec.falsification_tests.forEach((f) => lines.push(`- ${f}`));
    }
    if (spec.constraints.length) {
      lines.push('## Interpretation limits\n');
      spec.constraints.forEach((c) => lines.push(`- ${c}`));
    }
  }
  if (exp) {
    lines.push(`## Hypothesis\n\n${exp.hypothesis}`);
    if (exp.procedure.length) {
      lines.push('## Procedure\n');
      exp.procedure.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    }
  }
  if (run.verification) {
    lines.push(`## Adversarial verification\n\nScore: **${run.verification.score}/100** — ${run.verification.summary}`);
  }
  if (run.implementation?.files?.length) {
    lines.push('## Generated implementation\n');
    run.implementation.files.forEach((f) => {
      const lang = f.path.endsWith('.py') ? 'python' : f.path.endsWith('.md') ? 'markdown' : '';
      lines.push(`### \`${f.path}\` — ${f.purpose}\n\n\`\`\`${lang}\n${f.content}\n\`\`\``);
    });
  }
  if (run.mermaid) {
    lines.push(`## Hypothesis graph\n\n\`\`\`mermaid\n${run.mermaid}\n\`\`\``);
  }

  return lines.join('\n\n');
};
