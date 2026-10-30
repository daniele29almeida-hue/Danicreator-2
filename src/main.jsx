import React,{useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';
import{createClient}from'@supabase/supabase-js';
import{Plus,Search,Image,Video,Type,Copy,Edit3,Trash2,ArrowRight,Cloud,Upload,X,Save,ExternalLink,Link as LinkIcon}from'lucide-react';
import'./style.css';
const envUrl=import.meta.env.VITE_SUPABASE_URL,envKey=import.meta.env.VITE_SUPABASE_ANON_KEY;
function App(){
 const [url,setUrl]=useState(envUrl||localStorage.getItem('dc_url')||'');
 const [key,setKey]=useState(envKey||localStorage.getItem('dc_key')||'');
 const [db,setDb]=useState(null),[status,setStatus]=useState('offline'),[projects,setProjects]=useState([]);
 const [search,setSearch]=useState(''),[filter,setFilter]=useState('Todos'),[editing,setEditing]=useState(null),[showSetup,setShowSetup]=useState(false),[notice,setNotice]=useState('');
 const ping=(s)=>{setNotice(s);setTimeout(()=>setNotice(''),2600)};
 const connect=async(u=url,k=key)=>{
   if(!u||!k){ping('Informe a URL e a chave pública do Supabase.');return}
   try{const client=createClient(u,k);const {error}=await client.from('creator_projects').select('id').limit(1);if(error)throw error;
    localStorage.setItem('dc_url',u);localStorage.setItem('dc_key',k);setUrl(u);setKey(k);setDb(client);setShowSetup(false);setStatus('online');
   }catch(e){ping('Não conectou: '+e.message)}
 };
 useEffect(()=>{if(url&&key)connect(url,key)},[]);
 useEffect(()=>{if(!db)return;let alive=true;setStatus('syncing');
   const load=async()=>{const{data,error}=await db.from('creator_projects').select('*').order('updated_at',{ascending:false});if(error){setStatus('offline');ping(error.message);return}if(alive){setProjects(data||[]);setStatus('online')}};
   load();const channel=db.channel('dani-creator-live').on('postgres_changes',{event:'*',schema:'public',table:'creator_projects'},load).subscribe(s=>{if(s==='SUBSCRIBED')setStatus('online')});
   return()=>{alive=false;db.removeChannel(channel)};
 },[db]);
 const filtered=useMemo(()=>projects.filter(p=>(p.title+' '+p.description+' '+p.category).toLowerCase().includes(search.toLowerCase())&&(filter==='Todos'||(filter==='Imagem + Vídeo'&&p.image_prompts?.some(Boolean)&&p.video_prompts?.some(Boolean))||(filter==='Vídeo'&&p.video_prompts?.some(Boolean))||(filter==='Texto'&&p.text_prompts?.some(Boolean)))),[projects,search,filter]);
 const blank=()=>({title:'',description:'',category:'Geral',cover_url:'',image_prompts:['','',''],video_prompts:['','',''],text_prompts:['','','']});
 const save=async p=>{if(!db){ping('Conecte o Supabase para salvar e sincronizar.');return}if(!p.title.trim()){ping('Dê um nome ao projeto.');return}
   const payload={title:p.title,description:p.description,category:p.category,cover_url:p.cover_url,image_prompts:p.image_prompts,video_prompts:p.video_prompts,text_prompts:p.text_prompts,updated_at:new Date().toISOString()};
   const q=p.id?db.from('creator_projects').update(payload).eq('id',p.id):db.from('creator_projects').insert(payload);
   const{error}=await q;if(error){ping(error.message);return}setEditing(null);ping('Projeto salvo e sincronizado!');
 };
 const upload=async file=>{if(!db)throw new Error('Conecte o Supabase primeiro');const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=`${Date.now()}-${safe}`;const{error}=await db.storage.from('dani-media').upload(path,file,{upsert:false});if(error)throw error;return db.storage.from('dani-media').getPublicUrl(path).data.publicUrl};
 const del=async id=>{if(!confirm('Excluir este projeto para todos que usam o link?'))return;const{error}=await db.from('creator_projects').delete().eq('id',id);if(error)ping(error.message);else ping('Projeto excluído para todos.')};
 const copy=async t=>{try{await navigator.clipboard.writeText(t||'');ping('Prompt copiado!')}catch{ping('Não foi possível copiar neste navegador.')}};
 const share=()=>{navigator.clipboard?.writeText(location.href);ping('Link do aplicativo copiado!')};
 return <main className="shell">
  <header className="top"><div className="brand"><div className="logo">DC</div><div><b>DANI CREATOR</b><small>Prompts prontos para criar conteúdo</small></div></div><div className="head-actions"><span className={'sync '+status}><i/>{status==='online'?'Sincronizado':status==='syncing'?'Sincronizando':'Sem conexão'}</span><button className="iconbtn" onClick={share} title="Compartilhar link"><LinkIcon/></button><button className="iconbtn" onClick={()=>setShowSetup(true)} title="Configurar nuvem"><Cloud/></button></div></header>
  <section className="hero"><p>Olá, criadora 👋</p><h1>Escolha uma ferramenta e crie conteúdo que <em>chama atenção</em></h1></section>
  <div className="search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar ferramenta, categoria..."/></div>
  <nav className="filters">{['Todos','Imagem + Vídeo','Vídeo','Texto'].map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</nav>
  <section className="cards"><button className="add-card" onClick={()=>setEditing(blank())}><span><Plus/></span><b>Adicionar novo prompt</b><small>Crie um projeto com seus prompts</small></button>
   {filtered.map(p=><article className="project" key={p.id}><div className="cover">{p.cover_url?(p.cover_url.match(/\.(mp4|webm|mov)(\?|$)/i)?<video src={p.cover_url} controls/>:<img src={p.cover_url}/>):<div className="cover-placeholder"><span>DC</span><b>{p.title}</b></div>}<span className="cover-tag">{p.category||'GERAL'}</span></div><div className="project-body"><small className="pink">{p.category||'PROJETO'}</small><h2>{p.title}</h2><p>{p.description}</p><div className="counts"><span>{p.image_prompts?.filter(Boolean).length||0} prompts de imagem</span><span>{p.video_prompts?.filter(Boolean).length||0} prompts de vídeo</span></div><div className="quick">{(p.image_prompts||[]).map((v,i)=>v&&<button key={'i'+i} onClick={()=>copy(v)}>Imagem {i+1} <Copy/></button>)}{(p.video_prompts||[]).map((v,i)=>v&&<button key={'v'+i} onClick={()=>copy(v)}>Vídeo {i+1} <Copy/></button>)}</div><div className="actions"><button className="edit" onClick={()=>setEditing({...p})}><Edit3/> Editar</button><button className="delete" onClick={()=>del(p.id)} title="Excluir"><Trash2/></button></div><button className="view" onClick={()=>setEditing({...p})}>VER E COPIAR PROMPTS <ArrowRight/></button></div></article>)}
  </section>
  {!filtered.length&&<div className="empty">Nenhum projeto encontrado. Adicione seu primeiro prompt! 💗</div>}
  <footer><Cloud size={15}/> Seus projetos ficam salvos na nuvem e sincronizados em tempo real.</footer>
  {editing&&<Editor project={editing} setProject={setEditing} onClose={()=>setEditing(null)} onSave={save} upload={upload} copy={copy}/>}
  {showSetup&&<div className="overlay"><div className="modal setup"><button className="close" onClick={()=>setShowSetup(false)}><X/></button><h2>Conectar sincronização</h2><p>Use as credenciais públicas do seu projeto Supabase. Configure uma vez por dispositivo.</p><label>URL do projeto</label><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://xxxx.supabase.co"/><label>Chave anon/public</label><input value={key} onChange={e=>setKey(e.target.value)} placeholder="Chave pública do Supabase"/><button className="primary full" onClick={()=>connect()}>Conectar à nuvem</button><small>Não use a chave service_role. Somente a chave pública anon.</small></div></div>}
  {notice&&<div className="toast">{notice}</div>}
 </main>
}
function Editor({project,setProject,onClose,onSave,upload,copy}){
 const [p,setP]=useState({...project});const [busy,setBusy]=useState(false);
 const upd=(k,v)=>setP(x=>({...x,[k]:v}));const arr=(k,i,v)=>setP(x=>({...x,[k]:x[k].map((a,j)=>i===j?v:a)}));
 const media=async f=>{if(!f)return;setBusy(true);try{upd('cover_url',await upload(f))}catch(e){alert(e.message)}finally{setBusy(false)}};
 const sections=[['image_prompts','Prompts de imagem',Image],['video_prompts','Prompts de vídeo',Video],['text_prompts','Prompts de texto',Type]];
 return <div className="overlay"><div className="modal editor"><div className="modal-head"><div><small className="pink">DANI CREATOR</small><h2>{p.id?'Editar projeto':'Novo projeto'}</h2></div><button className="close" onClick={onClose}><X/></button></div>
  <label>Nome do projeto</label><input value={p.title} onChange={e=>upd('title',e.target.value)} placeholder="Ex.: Vídeo UGC hiper realista"/>
  <label>Categoria</label><input value={p.category||''} onChange={e=>upd('category',e.target.value)} placeholder="Ex.: Moda, Beleza, Casa..."/>
  <label>Descrição</label><textarea value={p.description||''} onChange={e=>upd('description',e.target.value)} placeholder="Descreva este conjunto de prompts..."/>
  <label>Foto ou vídeo de referência (opcional)</label><div className="upload"><input type="file" accept="image/*,video/*" onChange={e=>media(e.target.files?.[0])}/>{p.cover_url&&<a href={p.cover_url} target="_blank">Ver mídia <ExternalLink size={14}/></a>}{busy&&'Enviando...'}</div>
  {sections.map(([k,title,Icon])=><section className="prompt-section" key={k}><h3><Icon/> {title} <small>(até 3)</small></h3>{[0,1,2].map(i=><div className="prompt-field" key={i}><div className="field-head"><b>{title.slice(0,-1)} {i+1}</b><button onClick={()=>copy(p[k][i])}><Copy/> Copiar</button></div><textarea value={p[k][i]||''} onChange={e=>arr(k,i,e.target.value)} placeholder={`Cole aqui o ${title.toLowerCase()} ${i+1}...`}/></div>)}</section>)}
  <div className="modal-actions"><button className="secondary" onClick={onClose}>Cancelar</button><button className="primary" onClick={()=>onSave(p)}><Save/> Salvar e sincronizar</button></div>
 </div></div>
}
createRoot(document.getElementById('root')).render(<App/>);
