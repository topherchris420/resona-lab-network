import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Atom, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import {
  CATALYST_DOMAINS,
  compileCatalystRun,
  fetchCatalystRuns,
  type CatalystRun,
} from '@/lib/catalyst';

const STATUS_STYLES: Record<string, string> = {
  complete: 'text-emerald-400',
  running: 'text-cyan-400',
  pending: 'text-muted-foreground',
  failed: 'text-destructive',
};

const Catalyst = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<CatalystRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [idea, setIdea] = useState('');
  const [domain, setDomain] = useState<string>('resonance_signal_analysis');
  const [seed, setSeed] = useState(137);

  const loadRuns = async () => {
    try {
      setRuns(await fetchCatalystRuns());
    } catch (error) {
      console.error('Failed to load Catalyst runs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRuns();
  }, []);

  const myRuns = useMemo(() => runs.filter((r) => r.user_id === user?.id), [runs, user?.id]);

  const handleCompile = async () => {
    if (!user) {
      navigate('/auth?next=' + encodeURIComponent('/catalyst'));
      return;
    }
    if (idea.trim().length < 12) {
      toast({ title: 'Describe the idea', description: 'Give the compiler at least a sentence to work with.' });
      return;
    }
    setCompiling(true);
    try {
      const runId = await compileCatalystRun(user.id, { idea, domain, seed });
      toast({ title: 'Run compiled', description: 'Specification, experiment and verification are ready.' });
      navigate(`/catalyst/${runId}`);
    } catch (error) {
      console.error('Catalyst compile failed:', error);
      toast({
        title: 'Compile failed',
        description: error instanceof Error ? error.message : 'The research compiler could not finish this run.',
        variant: 'destructive',
      });
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section className="retro-panel p-6">
          <div className="flex items-center gap-3">
            <Atom className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl text-primary">CATALYST COMPILER</h1>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Turn an idea into a typed research specification, a falsifiable experiment, a runnable
            implementation, an adversarial verification report, and a hash-chained provenance ledger.
            Every run emits a hypothesis graph you can publish to the Resona feed.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <Label htmlFor="idea">Research idea</Label>
              <Textarea
                id="idea"
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                placeholder="Detect Schumann-band resonance structure in synthetic geomagnetic time series and quantify seed sensitivity."
                className="mt-2 min-h-24 bg-input border-2 border-border"
              />
            </div>
            <div>
              <Label>Domain</Label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger className="mt-2 border-2 border-border bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATALYST_DOMAINS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="seed">Seed</Label>
              <Input
                id="seed"
                type="number"
                value={seed}
                onChange={(event) => setSeed(Number(event.target.value) || 0)}
                className="mt-2 border-2 border-border bg-input"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCompile} disabled={compiling} className="retro-button w-full">
                {compiling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {compiling ? 'COMPILING…' : 'COMPILE RUN'}
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg text-foreground">
            {user ? 'YOUR RUNS' : 'PUBLIC RUNS'}
          </h2>
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading runs…</p>
          ) : (user ? myRuns : runs).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No runs yet — compile the first one above.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {(user ? myRuns : runs).map((run) => (
                <li key={run.id}>
                  <Link
                    to={`/catalyst/${run.id}`}
                    className="block retro-panel p-4 transition-colors hover:border-accent"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium text-foreground">
                        {run.spec?.title ?? run.idea.slice(0, 70)}
                      </span>
                      <span className={`shrink-0 text-[11px] uppercase tracking-[0.16em] ${STATUS_STYLES[run.status]}`}>
                        {run.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{run.idea}</p>
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span>{run.domain.replace(/_/g, ' ')}</span>
                      {run.verification ? (
                        <span className="flex items-center gap-1">
                          {run.verification.passed ? (
                            <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <TriangleAlert className="h-3 w-3 text-amber-400" />
                          )}
                          {run.verification.score}/100
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default Catalyst;
