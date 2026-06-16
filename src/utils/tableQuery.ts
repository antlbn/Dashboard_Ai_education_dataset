// Query DSL shared between the table's text search box and the column facet pills.
// Pattern: the query string is the single source of truth; facets are a projection.
//
// Syntax (clauses separated by commas, AND'd together):
//   field:A|B    positive facet  -> field IN {A, B}
//   -field:A     negated facet   -> field NOT IN {A}
//   term | term  free OR-group   -> matches if any term is found (global text)
//   -term        free exclude    -> row excluded if term is found (global text)
//
// Field tokens map known aliases to columns; everything else is free text.
// Facet values are matched case-insensitively against the column's known options
// and stored as their canonical option value (so "major:stem" -> "STEM").

export interface FacetField {
  field: string
  alias: string
  options: ReadonlyArray<string | number>
}

export interface ParsedQuery {
  facets: Record<string, Array<string | number>>        // positive: field IN values
  negatedFacets: Record<string, Array<string | number>> // negated: field NOT IN values
  freeIncludes: string[][]                              // OR-groups, all AND'd
  freeExcludes: string[]                                // free -terms
}

function matchOption(f: FacetField, raw: string): string | number | undefined {
  const low = raw.trim().toLowerCase()
  return f.options.find(o => String(o).toLowerCase() === low)
}

export function parseQuery(input: string, fields: FacetField[]): ParsedQuery {
  const byAlias = new Map(fields.map(f => [f.alias.toLowerCase(), f]))
  const facets: Record<string, Array<string | number>> = {}
  const negatedFacets: Record<string, Array<string | number>> = {}
  const freeIncludes: string[][] = []
  const freeExcludes: string[] = []

  for (const rawClause of input.split(',').map(c => c.trim()).filter(Boolean)) {
    const negated = rawClause.startsWith('-')
    const clause = negated ? rawClause.slice(1).trim() : rawClause

    const colon = clause.indexOf(':')
    if (colon > 0) {
      const f = byAlias.get(clause.slice(0, colon).trim().toLowerCase())
      if (f) {
        const values = clause.slice(colon + 1).split('|')
          .map(v => matchOption(f, v))
          .filter((v): v is string | number => v !== undefined)
        if (values.length) {
          const target = negated ? negatedFacets : facets
          target[f.field] = [...(target[f.field] ?? []), ...values]
        }
        continue
      }
      // unknown alias: fall through and treat the whole clause as free text
    }

    if (negated) {
      const t = clause.toLowerCase()
      if (t) freeExcludes.push(t)
    } else {
      const alts = clause.split('|').map(t => t.trim().toLowerCase()).filter(Boolean)
      if (alts.length) freeIncludes.push(alts)
    }
  }

  return { facets, negatedFacets, freeIncludes, freeExcludes }
}

// Serialize a parsed query back to canonical string form. Facet values are emitted
// in each column's declared option order so the output is stable (round-trippable).
export function stringifyQuery(q: ParsedQuery, fields: FacetField[]): string {
  const clauses: string[] = []

  const emitFacet = (prefix: string, store: Record<string, Array<string | number>>) => {
    for (const f of fields) {
      const vals = store[f.field]
      if (!vals?.length) continue
      const ordered = f.options.filter(o => vals.includes(o)).map(String)
      clauses.push(`${prefix}${f.alias}:${ordered.join('|')}`)
    }
  }

  emitFacet('', q.facets)
  emitFacet('-', q.negatedFacets)
  for (const group of q.freeIncludes) clauses.push(group.join('|'))
  for (const term of q.freeExcludes) clauses.push(`-${term}`)

  return clauses.join(', ')
}

// Canonical signature of the positive facet selection only, used to detect whether
// the string and the facet pills are already in sync (loop guard for two-way bind).
export function facetSignature(
  facets: Record<string, Array<string | number>>,
  fields: FacetField[],
): string {
  return fields
    .map(f => {
      const vals = facets[f.field]
      if (!vals?.length) return ''
      return `${f.alias}:${f.options.filter(o => vals.includes(o)).map(String).join('|')}`
    })
    .filter(Boolean)
    .join(',')
}
