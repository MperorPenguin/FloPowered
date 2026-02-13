'use client'
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
