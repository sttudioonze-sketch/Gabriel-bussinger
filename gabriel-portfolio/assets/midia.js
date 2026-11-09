/* Renderiza os slides de mídia: cada área é um card com mockups de notebook (thumb na tela), título e instituição. */
(function(){
const LANGS=['pt','en','es'];
const ASSETS='../gabriel-portfolio/assets/midia/';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=(v,k)=>Array.isArray(v)?v[k]:v;

function itemHTML(m,k){
  const video=!!m.id;
  const url=video?'https://www.youtube.com/watch?v='+m.id+(m.start?'&t='+m.start+'s':''):m.url;
  const img=m.image||m.id+'.jpg';
  const title=pick(m.title,k);
  return `<a class="media-item" href="${esc(url)}" target="_blank" rel="noopener noreferrer"${video?` data-video="${esc(m.id)}" data-start="${m.start||0}"`:''} aria-label="${esc(title)} · ${esc(m.org)}">`+
    `<div class="media-laptop"><img class="media-screen${m.image?' cover':''}" src="${ASSETS+esc(img)}" alt="" loading="lazy"><img class="media-frame" src="${ASSETS}laptop.png" alt="" aria-hidden="true">${video?'<span class="media-play" aria-hidden="true">▶</span>':''}</div>`+
    `<h4>${esc(title)}</h4><p>${esc(m.org)}</p></a>`;
}

function groupHTML(g,k,labels){
  const n=g.items.length;
  const fits=n<=(g.cols||5)*(g.rows||2);
  return `<section class="media-group${fits?' fits':''}" style="--cols:${g.cols||5};--rows:${g.rows||2};--scale:${g.scale||1};--n:${Math.min(n,g.cols||5)};flex-grow:${g.grow||1}">`+
    `<header class="media-group-head"><h3>${esc(pick(g.title,k))}</h3><span class="media-count">${n} ${esc(pick(g.unit||labels.videos,k))}</span>`+
    `<div class="media-nav" hidden><span class="media-pos"></span><button type="button" class="media-prev" aria-label="${esc(labels.prev[k])}">‹</button><button type="button" class="media-next" aria-label="${esc(labels.next[k])}">›</button></div></header>`+
    `<div class="media-track">${g.items.map(m=>itemHTML(m,k)).join('')}</div></section>`;
}

function setupCarousel(group){
  const track=group.querySelector('.media-track'),nav=group.querySelector('.media-nav'),pos=group.querySelector('.media-pos');
  const prev=group.querySelector('.media-prev'),next=group.querySelector('.media-next');
  const items=[...track.children];
  const rows=Number(getComputedStyle(group).getPropertyValue('--rows'))||2;
  function update(){
    const overflow=track.scrollWidth>track.clientWidth+4;
    nav.hidden=!overflow;if(!overflow)return;
    const colW=items[0].offsetWidth+(parseFloat(getComputedStyle(track).columnGap)||0);
    const cols=Math.max(1,Math.round((track.clientWidth+(colW-items[0].offsetWidth))/colW));
    const first=Math.round(track.scrollLeft/colW)*rows;
    const last=Math.min(items.length,first+cols*rows);
    pos.textContent=(first+1)+'–'+last+' / '+items.length;
    prev.disabled=track.scrollLeft<=4;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-4;
  }
  prev.addEventListener('click',()=>track.scrollBy({left:-track.clientWidth}));
  next.addEventListener('click',()=>track.scrollBy({left:track.clientWidth}));
  track.addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});
  addEventListener('resize',update);
  update();
}

window.renderMedia=function(cfg){
  const labels={videos:['vídeos','videos','vídeos'],prev:['Anterior','Previous','Anterior'],next:['Próximo','Next','Siguiente']};
  function apply(){
    const lang=LANGS.includes(location.hash.slice(1))?location.hash.slice(1):'pt';const k=LANGS.indexOf(lang);
    document.documentElement.lang=lang;
    document.title='Gabriel Bussinger | '+cfg.heading[k];
    document.querySelector('.media-kicker').textContent=cfg.kicker[k];
    document.querySelector('.media-heading').textContent=cfg.heading[k];
    document.querySelector('.pill').innerHTML='<span>'+['Portfólio','Portfolio','Portafolio'][k]+'</span><span class="sec">'+['Mídia','Media','Medios'][k]+'</span>';
    const areas=document.querySelector('.media-areas');
    areas.innerHTML=cfg.groups.map(g=>groupHTML(g,k,labels)).join('');
    areas.querySelectorAll('.media-group').forEach(setupCarousel);
    document.querySelector('.assina-t').innerHTML='<span class="footer-accent">GABRIEL BUSSINGER</span> | '+['GESTOR TÉCNICO E METODOLÓGICO','TECHNICAL & METHODOLOGY DIRECTOR','DIRECTOR TÉCNICO Y METODOLÓGICO'][k];
    document.querySelectorAll('[data-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.language===lang)));
    if(parent!==window)parent.postMessage({type:'portfolio-language',language:lang},'*');
  }
  document.querySelector('.review-tools').addEventListener('click',e=>{const b=e.target.closest('button');if(b)location.hash=b.dataset.language});
  addEventListener('hashchange',apply);apply();

  let modal,frame;
  function setupModal(){
    if(modal)return;
    modal=document.querySelector('.media-modal');frame=modal.querySelector('iframe');
    modal.querySelector('.modal-close').addEventListener('click',()=>modal.close());
    modal.addEventListener('close',()=>{frame.src=''});
    modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});
  }
  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-video]');if(!link)return;e.preventDefault();setupModal();
    modal.querySelector('.video-external').href=link.href;
    const start=Number(link.dataset.start)||0;
    frame.src='https://www.youtube-nocookie.com/embed/'+link.dataset.video+'?autoplay=1'+(start?'&start='+start:'');
    modal.showModal();
  });
};
})();
