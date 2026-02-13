'use client'

import { useEffect, useMemo, useState } from 'react'
import { Nav } from '@/components/Nav'
import { apiFetch, apiJson, DEFAULT_API, getApiBase, guessRendererHealthUrl, setApiBase } from '@/lib/api'

type Job = { job_id: string; status: string; message?: string; artifacts?: any; progress?: number }

type Category = { name: string; palette: string[]; subcategories: string[] }

export default function Page() {
  const [tab, setTab] = useState('0')
  const [apiBase, setApiBaseInput] = useState(DEFAULT_API)
  const [health, setHealth] = useState<{ api?: string; renderer?: string }>({})

  const [cats, setCats] = useState<Category[]>([])
  const [cat, setCat] = useState('All Incident Fires')
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobId, setJobId] = useState('')
  const [job, setJob] = useState<any>(null)
  const [inputType, setInputType] = useState<'pptx' | 'outline'>('outline')
  const [creativity, setCreativity] = useState('Med')

  const selectedCat = useMemo(() => cats.find((c) => c.name === cat), [cats, cat])

  useEffect(() => {
    const base = getApiBase()
    setApiBaseInput(base)
    refreshCategories()
    refreshJobs()
  }, [])

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
  }

  async function del(id: string) {
    await apiFetch(`/jobs/${id}`, { method: 'DELETE' })
    refreshJobs()
  }

  return (
    <main className="flex">
      <Nav tab={tab} setTab={setTab} />
      <section className="p-6 flex-1 space-y-4">
        <div className="bg-white p-4 rounded shadow space-y-2">
          <h3 className="font-semibold text-lg">Connection Settings (for GitHub Pages or any static host)</h3>
          <p className="text-sm text-slate-600">Set your deployed API URL here. This is saved in your browser.</p>
          <div className="flex gap-2">
            <input className="border rounded px-2 py-1 flex-1" value={apiBase} onChange={(e) => setApiBaseInput(e.target.value)} />
            <button className="px-3 py-1 bg-slate-800 text-white rounded" onClick={() => { setApiBase(apiBase); refreshCategories(); refreshJobs(); }}>Save</button>
            <button className="px-3 py-1 bg-sky-700 text-white rounded" onClick={checkHealth}>Check Health</button>
          </div>
          <div className="text-sm">API: <b>{health.api || 'not checked'}</b> | Renderer: <b>{health.renderer || 'not checked'}</b></div>
        </div>

        {tab === '0' && (
          <form onSubmit={submitTemplate} className="bg-white p-6 rounded shadow space-y-3">
            <h2 className="text-2xl font-semibold">Template-Locked</h2>
            <p className="text-sm text-slate-600">Upload old + template PPTX. Conversion runs in backend worker.</p>
            <input name="old_pptx" type="file" accept=".pptx" required />
            <input name="template_pptx" type="file" accept=".pptx" required />
            <button className="px-4 py-2 bg-sky-700 text-white rounded">Convert</button>
          </form>
        )}

        {tab === '1' && (
          <form onSubmit={submitCreative} className="bg-white p-6 rounded shadow space-y-3">
            <h2 className="text-2xl font-semibold">Creative NOG</h2>
            <label className="block">Category group
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="border p-1 block mt-1">
                {cats.map((c) => <option key={c.name}>{c.name}</option>)}
              </select>
            </label>
            <div className="text-sm text-slate-700">Locked palette: {(selectedCat?.palette || []).join(', ')}</div>
            <div>
              <label><input type="radio" checked={inputType === 'pptx'} onChange={() => setInputType('pptx')} /> Upload old PPTX</label>
              <label className="ml-3"><input type="radio" checked={inputType === 'outline'} onChange={() => setInputType('outline')} /> Paste outline</label>
            </div>
            {inputType === 'pptx' ? (
              <input name="old_pptx" type="file" accept=".pptx" />
            ) : (
              <textarea name="outline_text" className="w-full border p-2 h-40" placeholder="Paste outline text" />
            )}
            <div>Creativity: <select value={creativity} onChange={(e) => setCreativity(e.target.value)} className="border p-1"><option>Low</option><option>Med</option><option>High</option></select></div>
            <button className="px-4 py-2 bg-emerald-700 text-white rounded">Generate</button>
          </form>
        )}

        {tab === '2' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-3">Jobs</h2>
            <div className="space-y-2">
              {jobs.map((j) => (
                <div key={j.job_id} className="border rounded p-2 flex justify-between items-center">
                  <div>
                    <div>{j.job_id}</div>
                    <div className="text-sm text-slate-600">{j.status} ({j.progress ?? 0}%) - {j.message}</div>
                  </div>
                  <div className="space-x-3">
                    <a className="text-blue-600 underline" href={`${getApiBase()}/jobs/${j.job_id}/download`}>Download</a>
                    <button onClick={() => del(j.job_id)} className="text-red-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Live Job</h3>
          {jobId ? (
            <div className="space-y-1 text-sm">
              <div>ID: {jobId}</div>
              <div>Status: {job?.status}</div>
              <div>Message: {job?.message}</div>
              {job?.artifacts?.slidespec && <a className="underline text-blue-700" href={`${getApiBase()}/jobs/${jobId}/spec`}>View SlideSpec JSON</a>}
            </div>
          ) : <div>No active job</div>}
        </div>
      </section>
    </main>
  )
import {useEffect,useState} from 'react'
import {Nav} from '@/components/Nav'
import {API,j} from '@/lib/api'

export default function Page(){
  const [tab,setTab]=useState('0');
  const [cats,setCats]=useState<any[]>([]);const [cat,setCat]=useState('All Incident Fires');
  const [jobs,setJobs]=useState<any[]>([]); const [jobId,setJobId]=useState(''); const [job,setJob]=useState<any>(null);
  const [inputType,setInputType]=useState<'pptx'|'outline'>('outline');
  const [creativity,setCreativity]=useState('Med');
  useEffect(()=>{j('/categories').then(d=>setCats(d.groups)); refreshJobs();},[])
  useEffect(()=>{if(!jobId)return; const t=setInterval(async()=>{const d=await j(`/jobs/${jobId}`);setJob(d); if(['done','failed'].includes(d.status)) {clearInterval(t);refreshJobs();}},1500); return ()=>clearInterval(t)},[jobId])
  async function refreshJobs(){setJobs(await j('/jobs'))}
  async function submitTemplate(e:any){e.preventDefault();const fd=new FormData(e.target);const r=await fetch(`${API}/convert/template-locked`,{method:'POST',body:fd});const d=await r.json();setJobId(d.job_id)}
  async function submitCreative(e:any){e.preventDefault();const fd=new FormData(e.target);fd.set('category_group',cat);fd.set('creativity',creativity); if(inputType==='outline'){fd.delete('old_pptx')} const r=await fetch(`${API}/convert/creative`,{method:'POST',body:fd}); const d=await r.json();setJobId(d.job_id)}
  async function del(id:string){await fetch(`${API}/jobs/${id}`,{method:'DELETE'}); refreshJobs()}
  return <main className='flex'><Nav tab={tab} setTab={setTab}/><section className='p-6 flex-1 space-y-4'>
    {tab==='0' && <form onSubmit={submitTemplate} className='bg-white p-6 rounded shadow space-y-3'><h2 className='text-2xl font-semibold'>Template-Locked</h2><input name='old_pptx' type='file' accept='.pptx' required/><input name='template_pptx' type='file' accept='.pptx' required/><button className='px-4 py-2 bg-sky-700 text-white rounded'>Convert</button></form>}
    {tab==='1' && <form onSubmit={submitCreative} className='bg-white p-6 rounded shadow space-y-3'><h2 className='text-2xl font-semibold'>Creative NOG</h2><select value={cat} onChange={e=>setCat(e.target.value)} className='border p-1'>{cats.map((c:any)=><option key={c.name}>{c.name}</option>)}</select><div><label><input type='radio' checked={inputType==='pptx'} onChange={()=>setInputType('pptx')}/> Upload old PPTX</label> <label className='ml-3'><input type='radio' checked={inputType==='outline'} onChange={()=>setInputType('outline')}/> Paste outline</label></div>{inputType==='pptx'?<input name='old_pptx' type='file' accept='.pptx'/>:<textarea name='outline_text' className='w-full border p-2 h-40' placeholder='Paste outline text'/>}<div>Creativity: <select value={creativity} onChange={e=>setCreativity(e.target.value)} className='border p-1'><option>Low</option><option>Med</option><option>High</option></select></div><button className='px-4 py-2 bg-emerald-700 text-white rounded'>Generate</button></form>}
    {tab==='2' && <div className='bg-white p-6 rounded shadow'><h2 className='text-2xl font-semibold mb-3'>Jobs</h2><div className='space-y-2'>{jobs.map((j:any)=><div key={j.job_id} className='border rounded p-2 flex justify-between'><div><div>{j.job_id}</div><div className='text-sm text-slate-600'>{j.status} - {j.message}</div></div><div className='space-x-3'><a className='text-blue-600 underline' href={`${API}/jobs/${j.job_id}/download`}>Download</a><button onClick={()=>del(j.job_id)} className='text-red-700'>Delete</button></div></div>)}</div></div>}
    <div className='bg-white p-4 rounded shadow'><h3 className='font-semibold'>Live job</h3>{jobId?<div><div>{jobId}</div><div>{job?.status}</div><div>{job?.message}</div>{job?.artifacts?.slidespec && <a className='underline text-blue-700' href={`${API}/jobs/${jobId}/spec`}>View SlideSpec JSON</a>}</div>:<div>No active job</div>}</div>
  </section></main>
}
