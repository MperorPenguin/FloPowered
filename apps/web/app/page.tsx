'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Nav } from '@/components/Nav'
import { apiFetch, apiJson, DEFAULT_API, getApiBase, guessRendererHealthUrl, setApiBase } from '@/lib/api'

type Job = { job_id: string; status: string; message?: string; artifacts?: any; progress?: number }
type Category = { name: string; palette: string[]; subcategories: string[] }

export default function Page() {
  const [tab, setTab] = useState('1')
  const [apiBase, setApiBaseInput] = useState(DEFAULT_API)
  const [health, setHealth] = useState<{ api?: string; renderer?: string }>({})

  const [cats, setCats] = useState<Category[]>([])
  const [cat, setCat] = useState('All Incident Fires')
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobId, setJobId] = useState('')
  const [job, setJob] = useState<any>(null)
  const [inputType, setInputType] = useState<'pptx' | 'outline'>('pptx')
  const [creativity, setCreativity] = useState('Med')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<HTMLElement[]>([])

  const selectedCat = useMemo(() => cats.find((c) => c.name === cat), [cats, cat])

  useEffect(() => {
    const base = getApiBase()
    setApiBaseInput(base)
    refreshCategories()
    refreshJobs()
  }, [])

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    }
    gsap.fromTo(cardRefs.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
  }, [tab])

  useEffect(() => {
    if (!jobId) return
    const t = setInterval(async () => {
      try {
        const d = await apiJson(`/jobs/${jobId}`)
        setJob(d)
        if (['done', 'failed'].includes(d.status)) {
          clearInterval(t)
          refreshJobs()
        }
      } catch {
        clearInterval(t)
      }
    }, 1500)
    return () => clearInterval(t)
  }, [jobId])

  async function refreshCategories() {
    const d = await apiJson('/categories')
    setCats(d.groups || [])
  }

  async function refreshJobs() {
    setJobs(await apiJson('/jobs'))
  }

  async function checkHealth() {
    try {
      const api = await apiJson('/health')
      setHealth((h) => ({ ...h, api: api?.ok ? 'healthy' : 'unhealthy' }))
    } catch {
      setHealth((h) => ({ ...h, api: 'unreachable' }))
    }

    try {
      const r = await fetch(guessRendererHealthUrl())
      const d = await r.json()
      setHealth((h) => ({ ...h, renderer: d?.ok ? 'healthy' : 'unhealthy' }))
    } catch {
      setHealth((h) => ({ ...h, renderer: 'unknown/offline' }))
    }
  }

  async function submitTemplate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const r = await apiFetch('/convert/template-locked', { method: 'POST', body: fd })
    const d = await r.json()
    setJobId(d.job_id)
    setTab('2')
  }

  async function submitCreative(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('category_group', cat)
    fd.set('creativity', creativity)
    if (inputType === 'outline') fd.delete('old_pptx')
    const r = await apiFetch('/convert/creative', { method: 'POST', body: fd })
    const d = await r.json()
    setJobId(d.job_id)
    setTab('2')
  }

  async function del(id: string) {
    await apiFetch(`/jobs/${id}`, { method: 'DELETE' })
    refreshJobs()
  }

  return (
    <main className="flex bg-gradient-to-br from-slate-100 via-slate-100 to-cyan-50 min-h-screen">
      <Nav tab={tab} setTab={setTab} />
      <section className="p-7 flex-1 space-y-5">
        <div ref={heroRef} className="rounded-2xl bg-slate-900 text-white p-6 shadow-lg">
          <h2 className="text-3xl font-semibold">Create better decks with less effort</h2>
          <p className="text-slate-300 mt-2">
            Upload your old PowerPoint as reference, choose creativity level and NOG category, and the pipeline builds a fresh but rule-safe deck.
          </p>
        </div>

        <div ref={(el) => { if (el) cardRefs.current[0] = el }} className="bg-white p-4 rounded-2xl shadow">
          <h3 className="font-semibold text-lg">Connection Settings</h3>
          <p className="text-sm text-slate-600">Works on GitHub Pages/static hosting: set your deployed API URL once.</p>
          <div className="flex gap-2 mt-2">
            <input className="border rounded-lg px-3 py-2 flex-1" value={apiBase} onChange={(e) => setApiBaseInput(e.target.value)} />
            <button className="px-3 py-2 bg-slate-800 text-white rounded-lg" onClick={() => { setApiBase(apiBase); refreshCategories(); refreshJobs() }}>Save</button>
            <button className="px-3 py-2 bg-cyan-700 text-white rounded-lg" onClick={checkHealth}>Check</button>
          </div>
          <div className="text-sm mt-2">API: <b>{health.api || 'not checked'}</b> · Renderer: <b>{health.renderer || 'not checked'}</b></div>
        </div>

        {tab === '0' && (
          <form ref={(el) => { if (el) cardRefs.current[1] = el }} onSubmit={submitTemplate} className="bg-white p-6 rounded-2xl shadow space-y-3">
            <h3 className="text-2xl font-semibold">Template-Locked conversion</h3>
            <p className="text-sm text-slate-600">Strict mode: reuses template structure for consistency.</p>
            <input name="old_pptx" type="file" accept=".pptx" required className="block" />
            <input name="template_pptx" type="file" accept=".pptx" required className="block" />
            <button className="px-4 py-2 bg-cyan-700 text-white rounded-lg">Convert</button>
          </form>
        )}

        {tab === '1' && (
          <form ref={(el) => { if (el) cardRefs.current[1] = el }} onSubmit={submitCreative} className="bg-white p-6 rounded-2xl shadow space-y-3">
            <h3 className="text-2xl font-semibold">Creative NOG conversion (recommended)</h3>
            <p className="text-sm text-slate-600">Simple workflow: upload old PPTX as reference, we extract ideas and regenerate creatively under NOG rules.</p>

            <label className="block text-sm font-medium">NOG Category</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="border rounded-lg p-2 w-full">
              {cats.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
            <div className="text-sm">Palette lock: {(selectedCat?.palette || []).join(', ')}</div>

            <label className="block text-sm font-medium">Creativity</label>
            <select value={creativity} onChange={(e) => setCreativity(e.target.value)} className="border rounded-lg p-2 w-full">
              <option>Low</option><option>Med</option><option>High</option>
            </select>

            <label className="block text-sm font-medium">Old PowerPoint (reference)</label>
            <input name="old_pptx" type="file" accept=".pptx" className="block" />

            <button type="button" className="text-sm text-cyan-700 underline" onClick={() => setShowAdvanced((v) => !v)}>
              {showAdvanced ? 'Hide advanced input' : 'Show advanced input (outline text)'}
            </button>

            {showAdvanced && (
              <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                <div>
                  <label><input type="radio" checked={inputType === 'pptx'} onChange={() => setInputType('pptx')} /> Use uploaded PPTX</label>
                  <label className="ml-3"><input type="radio" checked={inputType === 'outline'} onChange={() => setInputType('outline')} /> Use outline text</label>
                </div>
                {inputType === 'outline' && (
                  <textarea name="outline_text" className="w-full border rounded-lg p-2 h-32" placeholder="Paste outline text" />
                )}
              </div>
            )}

            <button className="px-4 py-2 bg-emerald-700 text-white rounded-lg">Generate Creative Deck</button>
          </form>
        )}

        {tab === '2' && (
          <div ref={(el) => { if (el) cardRefs.current[1] = el }} className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow">
              <h3 className="font-semibold">Live Job</h3>
              {jobId ? (
                <div className="text-sm mt-2">
                  <div>ID: {jobId}</div>
                  <div>Status: {job?.status}</div>
                  <div>Message: {job?.message}</div>
                  {job?.artifacts?.slidespec && <a className="underline text-blue-700" href={`${getApiBase()}/jobs/${jobId}/spec`}>View SlideSpec JSON</a>}
                </div>
              ) : <div>No active job</div>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-xl font-semibold mb-3">Jobs</h3>
              <div className="space-y-2">
                {jobs.map((j) => (
                  <div key={j.job_id} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{j.job_id}</div>
                      <div className="text-sm text-slate-600">{j.status} ({j.progress ?? 0}%) — {j.message}</div>
                    </div>
                    <div className="space-x-3">
                      <a className="text-blue-600 underline" href={`${getApiBase()}/jobs/${j.job_id}/download`}>Download</a>
                      <button onClick={() => del(j.job_id)} className="text-red-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={(el) => { if (el) cardRefs.current[2] = el }} className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">How the rules work (exact process)</h3>
          <ol className="list-decimal ml-5 text-sm text-slate-700 space-y-1">
            <li>Your uploaded old PPTX is stored in the job folder and treated as reference material for structure/content extraction.</li>
            <li>We build a DeckModel from slides: titles, bullets, and text blocks.</li>
            <li>Intent classification runs (rules-only by default; optional OpenAI if API key configured).</li>
            <li>A SlideSpec JSON is generated (template_id, motif, palette mapping, animation plan, text blocks).</li>
            <li>Validator enforces constraints: NOG palette lock, minimum fonts (title ≥32pt / body ≥24pt), and overflow split to Part 2.</li>
            <li>Renderer deterministically generates output PPTX from SlideSpec. Same input + settings yields repeatable output structure.</li>
          </ol>
        </div>
      </section>
    </main>
  )
}
