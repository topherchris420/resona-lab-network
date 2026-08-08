import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileCode2,
  FlaskConical,
  Hash,
  Loader2,
  Rocket,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import Header from '@/components/Header';
import HypothesisGraph3D from '@/components/catalyst/HypothesisGraph3D';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { createProject } from '@/lib/socialApi';
import {
  fetchCatalystEvents,
  fetchCatalystRun,
  linkRunToProject,
  runToProjectContent,
  type CatalystEvent,
  type CatalystRun,
} from '@/lib/catalyst';

const STATUS_COLOR: Record<string, string> = {
  established: 'text-emerald-400',
  experimental: 'text-cyan-400',
  speculative: 'text-amber-400',
};

const Section = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <section className="retro-panel mt-6 p-5">
    <h2 className="flex items-center gap-2 font-display text-base text-primary">
      {icon}
      {title}
    </h2>
    <div className="mt-3 text-sm text-muted-foreground">{children}</div>
  </section>
);

const List = ({ items }: { items?: string[] }) =>
  items?.length ? (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  ) : (
    <p className="text-muted-foreground/70">None recorded.</p>
  );

const CatalystRunPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [run, setRun] = useState<CatalystRun | null>(null);
  const [events, setEvents] = useState<CatalystEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const [runData, eventData] = await Promise.all([fetchCatalystRun(id), fetchCatalystEvents(id)]);
        if (!active) return;
        setRun(runData);
        setEvents(eventData);
      } catch (error) {
        console.error('Failed to load run:', error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const publish = async () => {
    if (!run || !user) return;
    setPublishing(true);
    try {
      const projectId = await createProject(user.id, {
        title: run.spec?.title ?? run.idea.slice(0, 80),
        abstract: run.spec?.objective ?? run.idea,
        content: runToProjectContent(run),
        tags: run.spec?.tags ?? [run.domain],
      });
      await linkRunToProject(run.id, projectId);
      setRun({ ...run, project_id: projectId });
      toast({ title: 'Published to Resona', description: 'This run is now a project in the feed.' });
    } catch (error) {
      console.error('Publish failed:', error);
      toast({
        title: 'Publish failed',
        description: error instanceof Error ? error.message : 'Could not publish this run.',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto flex items-center gap-2 px-4 py-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading run…
        </main>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <p className="text-muted-foreground">This Catalyst run does not exist or is private.</p>
          <Link to="/catalyst" className="mt-4 inline-block text-primary underline">
            Back to Catalyst
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link to="/catalyst" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> ALL RUNS
        </Link>

        <header className="retro-panel mt-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-2xl text-primary">{run.spec?.title ?? run.idea.slice(0, 80)}</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{run.idea}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{run.domain.replace(/_/g, ' ')}</Badge>
                <Badge variant="outline">seed {run.seed}</Badge>
                <Badge variant="outline">{run.mode === 'ai' ? 'AI backend' : 'local engine'}</Badge>
                {run.spec ? (
                  <span className={`text-xs uppercase tracking-[0.16em] ${STATUS_COLOR[run.spec.scientific_status]}`}>
                    {run.spec.scientific_status}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {run.verification ? (
                <div className="flex items-center gap-2 text-sm">
                  {run.verification.passed ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                  )}
                  <span className="text-foreground">{run.verification.score}/100</span>
                </div>
              ) : null}
              {run.project_id ? (
                <Button asChild variant="ghost" className="retro-button">
                  <Link to={`/project/${run.project_id}`}>VIEW PROJECT</Link>
                </Button>
              ) : user?.id === run.user_id && run.status === 'complete' ? (
                <Button onClick={publish} disabled={publishing} className="retro-button">
                  {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                  PUBLISH TO FEED
                </Button>
              ) : null}
            </div>
          </div>
          {run.status === 'failed' ? (
            <p className="mt-4 text-sm text-destructive">Compile failed: {run.error}</p>
          ) : null}
        </header>

        {run.hypothesis_graph ? (
          <Section title="HYPOTHESIS GRAPH">
            <HypothesisGraph3D graph={run.hypothesis_graph} />
            <p className="mt-2 text-xs">
              Claims, evidence requirements, metrics and falsifiers connected around the run objective.
            </p>
          </Section>
        ) : null}

        {run.spec ? (
          <Section title="RESEARCH SPECIFICATION">
            <p className="text-foreground">{run.spec.objective}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-[0.16em] text-foreground">Claims</h3>
                <ul className="mt-2 space-y-2">
                  {run.spec.claims.map((claim, i) => (
                    <li key={i} className="rounded-md border border-border bg-card/40 p-3">
                      <span className={`text-[10px] uppercase tracking-[0.16em] ${STATUS_COLOR[claim.status]}`}>
                        {claim.status}
                      </span>
                      <p className="mt-1 text-foreground">{claim.statement}</p>
                      {claim.rationale ? <p className="mt-1 text-xs">{claim.rationale}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-foreground">Falsification tests</h3>
                  <div className="mt-2">
                    <List items={run.spec.falsification_tests} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-foreground">Success metrics</h3>
                  <div className="mt-2">
                    <List items={run.spec.success_metrics} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-foreground">Interpretation limits</h3>
                  <div className="mt-2">
                    <List items={run.spec.constraints} />
                  </div>
                </div>
              </div>
            </div>
          </Section>
        ) : null}

        {run.experiment ? (
          <Section title="EXPERIMENT DESIGN" icon={<FlaskConical className="h-4 w-4" />}>
            <p className="text-foreground">{run.experiment.hypothesis}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-[0.16em] text-foreground">Procedure</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  {run.experiment.procedure.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-foreground">Variables</h3>
                  <div className="mt-2">
                    <List items={[...run.experiment.independent_variables, ...run.experiment.dependent_variables]} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-foreground">Interpretation limits</h3>
                  <div className="mt-2">
                    <List items={run.experiment.interpretation_limits} />
                  </div>
                </div>
              </div>
            </div>
          </Section>
        ) : null}

        {run.implementation ? (
          <Section title="IMPLEMENTATION BUNDLE" icon={<FileCode2 className="h-4 w-4" />}>
            <p>{run.implementation.summary}</p>
            <p className="mt-1 text-xs">
              Run with <code className="text-primary">{run.implementation.run_command}</code>
            </p>
            <div className="mt-4 space-y-4">
              {run.implementation.files.map((file) => (
                <div key={file.path}>
                  <p className="text-xs text-foreground">
                    <span className="text-primary">{file.path}</span> — {file.purpose}
                  </p>
                  <pre className="mt-1 max-h-72 overflow-auto rounded-md border border-border bg-card/60 p-3 text-[11px] leading-relaxed text-foreground">
                    <code>{file.content}</code>
                  </pre>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {run.verification || run.validation ? (
          <Section title="VERIFICATION & LOCAL GATES">
            {run.verification ? <p className="text-foreground">{run.verification.summary}</p> : null}
            <ul className="mt-3 space-y-2">
              {[...(run.verification?.findings ?? []), ...(run.validation?.findings ?? [])].map((finding, i) => (
                <li key={i} className="rounded-md border border-border bg-card/40 p-3">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {finding.severity} · {finding.category}
                  </span>
                  <p className="mt-1 text-foreground">{finding.message}</p>
                </li>
              ))}
            </ul>
            {run.validation ? (
              <p className="mt-3 text-xs">
                Local gates: {run.validation.checks.join(', ')} —{' '}
                <span className={run.validation.passed ? 'text-emerald-400' : 'text-destructive'}>
                  {run.validation.passed ? 'passed' : 'failed'}
                </span>
              </p>
            ) : null}
          </Section>
        ) : null}

        {events.length ? (
          <Section title="PROVENANCE LEDGER" icon={<Hash className="h-4 w-4" />}>
            <ol className="space-y-1 font-mono text-[11px]">
              {events.map((event) => (
                <li key={event.id} className="flex items-center gap-3">
                  <span className="w-6 text-muted-foreground">{event.seq}</span>
                  <span className="w-40 shrink-0 text-primary">{event.stage}</span>
                  <span className="truncate text-muted-foreground">{event.hash.slice(0, 32)}…</span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-xs">Each entry is SHA-256 linked to the previous one, making tampering detectable.</p>
          </Section>
        ) : null}
      </main>
    </div>
  );
};

export default CatalystRunPage;
