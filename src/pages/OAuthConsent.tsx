import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";

// The supabase.auth.oauth namespace is in beta and not yet in the generated
// types, so we narrow it locally to the three methods we call.
type OAuthResult = {
  data?: {
    client?: { name?: string } | null;
    redirect_url?: string | null;
    redirect_to?: string | null;
  } | null;
  error?: { message: string } | null;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};

const oauth = (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<OAuthResult["data"]>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // Preserve the FULL consent URL so auth returns the user here.
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  const clientName = details?.client?.name ?? "an application";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="retro-panel p-8 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <span className="text-xl font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-xl font-bold text-primary font-display">RESONA</span>
          </div>

          {error ? (
            <p className="text-destructive text-sm">
              Could not load this authorization request: {error}
            </p>
          ) : !details ? (
            <p className="text-muted-foreground">Loading authorization request…</p>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Connect {clientName}
                </h1>
                <p className="text-muted-foreground">
                  {clientName} wants to access Resona as you. It will be able to
                  resonate with and fork projects on your behalf.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  className="retro-button flex-1"
                  disabled={busy}
                  onClick={() => decide(true)}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => decide(false)}
                >
                  Deny
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthConsent;
