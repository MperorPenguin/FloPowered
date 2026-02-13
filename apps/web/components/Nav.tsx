'use client'

const items = ['Convert (Template-Locked)', 'Creative NOG', 'Jobs']

export function Nav({ tab, setTab }: { tab: string; setTab: (x: string) => void }) {
  return (
    <aside className="w-72 min-h-screen bg-slate-950 text-white p-6 border-r border-slate-800">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-cyan-300">NOG Deck Studio</p>
        <h1 className="text-2xl font-semibold leading-tight mt-2">PowerPoint conversion made simple</h1>
      </div>
      <nav className="space-y-2">
        {items.map((label, i) => {
          const active = tab === String(i)
          return (
            <button
              key={label}
              onClick={() => setTab(String(i))}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                active
                  ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-100'
                  : 'border border-slate-800 hover:bg-slate-900 text-slate-200'
              }`}
            >
              {label}
            </button>
          )
        })}
      </nav>
      <div className="mt-8 text-xs text-slate-400 leading-relaxed">
        Upload once, then let the engine extract structure, enforce rules, and render a polished deck.
      </div>
    </aside>
  )
}
export function Nav({tab,setTab}:{tab:string,setTab:(x:any)=>void}){return <aside className='w-64 min-h-screen bg-slate-900 text-white p-4 space-y-2'><h1 className='text-xl font-bold mb-8'>NOG Deck Studio</h1>{['Convert (Template-Locked)','Creative NOG','Jobs'].map((x,i)=><button key={x} className={`block w-full text-left px-3 py-2 rounded ${tab===String(i)?'bg-slate-700':'hover:bg-slate-800'}`} onClick={()=>setTab(String(i))}>{x}</button>)}</aside>}
