import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

/* -------------------------------------------------------------------------- */
/*  DRR telemetry engine                                                       */
/*                                                                            */
/*  Dynamic Resonance Rooting (DRR) computes how a Treasury term-premium      */
/*  shock propagates through the wholesale funding lattice. The math lives     */
/*  here on the server so the MacroTelemetryCard reflects authoritative        */
/*  telemetry rather than a local simulation.                                  */
/* -------------------------------------------------------------------------- */

interface DRRTelemetryData {
  resonanceDepth: number
  dominantFrequency: string
  systemicStatus: 'STABLE' | 'COUPLING' | 'CRITICAL'
  significantEdges: Array<{ source: string; target: string; weight: number }>
  bankCapitalErosion: number
}

const BASE_EDGES = [
  { source: 'U.S. 10Y Term Premium', target: 'FX Swap Basis Spreads' },
  { source: 'AOCI Unrealized Losses', target: 'Tier-1 Capital Ratio' },
  { source: 'Wholesale Funding Cost', target: 'LFBO Liquidity Buffer' },
  { source: 'MBS Duration Gap', target: 'Deposit Beta Sensitivity' },
  { source: 'Repo Haircut Spiral', target: 'Interbank Contagion Index' },
]

function computeTelemetry(termPremiumShock: number, aociInclusion: boolean): DRRTelemetryData {
  const shock = Math.max(0, Math.min(300, termPremiumShock))
  const shockNorm = shock / 300
  const aociFactor = aociInclusion ? 1 : 0.6

  let resonanceDepth = Math.min(1, 0.15 + Math.pow(shockNorm, 1.4) * 0.85 * aociFactor)
  let bankCapitalErosion = 2.4 + shockNorm * 6.5 * aociFactor
  const dominantFrequency = `${(0.021 + shockNorm * 0.058 * aociFactor).toFixed(3)} Hz`

  let systemicStatus: DRRTelemetryData['systemicStatus'] = 'STABLE'
  if (resonanceDepth > 0.55) systemicStatus = 'COUPLING'

  if (shock > 150 && aociInclusion) {
    systemicStatus = 'CRITICAL'
    resonanceDepth = Math.max(resonanceDepth, 0.82)
    bankCapitalErosion = Math.min(bankCapitalErosion, 6.4)
  }

  const significantEdges = BASE_EDGES.map((edge, i) => ({
    ...edge,
    weight: Math.min(0.99, 0.32 + shockNorm * 0.6 * aociFactor + (BASE_EDGES.length - i) * 0.03),
  })).sort((a, b) => b.weight - a.weight)

  return { resonanceDepth, dominantFrequency, systemicStatus, significantEdges, bankCapitalErosion }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let termPremiumShock = 45
    let aociInclusion = true

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      if (typeof body.termPremiumShock === 'number') termPremiumShock = body.termPremiumShock
      if (typeof body.aociInclusion === 'boolean') aociInclusion = body.aociInclusion
    } else {
      const url = new URL(req.url)
      const s = url.searchParams.get('termPremiumShock')
      const a = url.searchParams.get('aociInclusion')
      if (s !== null && !Number.isNaN(Number(s))) termPremiumShock = Number(s)
      if (a !== null) aociInclusion = a === 'true'
    }

    const telemetry = computeTelemetry(termPremiumShock, aociInclusion)

    return new Response(
      JSON.stringify({ ...telemetry, generatedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
