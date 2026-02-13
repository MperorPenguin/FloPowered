export const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000/api'
export const j=(u:string,o?:RequestInit)=>fetch(`${API}${u}`,o).then(r=>r.json())
