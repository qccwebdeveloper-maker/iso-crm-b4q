import { useState, useEffect } from 'react';
import axios from 'axios';

/* Shared source of truth for ISO standards + their clauses.
   Standards (and their clauses) are configured in Admin → Standards and stored
   in the Standard schema; every QMS form reads them from here instead of using
   a hard-coded catalogue. */
export default function useStandards() {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    axios.get('/api/standards')
      .then(r => { if (alive) setStandards((r.data || []).filter(s => s.active !== false)); })
      .catch(() => { if (alive) setStandards([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const byName = Object.fromEntries(standards.map(s => [s.name, s]));
  const names  = standards.map(s => s.name);
  return { standards, byName, names, loading };
}

/* Normalize whatever a form holds as "selected standards" into an array of names.
   Accepts an array or a comma-joined string (the shape used across the forms). */
export function standardNames(value) {
  return Array.isArray(value)
    ? value.map(s => String(s).trim()).filter(Boolean)
    : String(value || '').split(',').map(s => s.trim()).filter(Boolean);
}

/* Collect the clauses for the given standard name(s) from the fetched catalogue,
   deduped by clause number + text and kept in catalogue order. Each clause is a
   { no, text } record as stored on the Standard schema. */
export function clausesForStandards(byName, value) {
  const seen = new Set();
  const out = [];
  standardNames(value).forEach(name => {
    const std = byName[name];
    (std?.clauses || []).forEach(c => {
      const key = `${c.no || ''}|${c.text || ''}`;
      if (!seen.has(key)) { seen.add(key); out.push({ no: c.no || '', text: c.text || '' }); }
    });
  });
  return out;
}
