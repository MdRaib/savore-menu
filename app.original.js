let data = {
  brand: SITE_CONFIG.BRAND_NAME,
  tagline: SITE_CONFIG.TAGLINE,
  logo: SITE_CONFIG.LOGO,
  categories: SITE_CONFIG.CATEGORIES,
  products: SITE_CONFIG.PRODUCTS.map((p, i) => ({id:p.id || i+1, ...p}))
};
let cart = [];
let activeCategory = "সব";
let db = null;
const $ = s => document.querySelector(s);
const money = n => `৳${Number(n).toLocaleString("en-US")}`;
const escapeHtml = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function unitPrice(p){ return (p.offerPrice && Number(p.offerPrice) < Number(p.price)) ? Number(p.offerPrice) : Number(p.price); }
function cartSubtotal(){ return cart.reduce((sum,c)=>{ const p=data.products.find(x=>x.id===c.id); return sum + (p ? unitPrice(p)*c.qty : 0); },0); }
function render(){
  document.title=`${data.brand} — Digital Menu`;
  $("#navLogo").src=data.logo; $("#navLogo").alt=data.brand;
  $("#brandName").textContent=data.brand; $("#brandTagline").textContent=data.tagline;
  $("#footerBrand").textContent=data.brand; $("#footerTagline").textContent=data.tagline; $("#year").textContent=new Date().getFullYear();
  renderCategories(); renderProducts(); renderCart();
}
function renderCategories(){
  $("#categoryTabs").innerHTML=data.categories.map(c=>`<button type="button" class="${c===activeCategory?'active':''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('');
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderCategories();renderProducts();});
}
function renderProducts(){
  const items=activeCategory==="সব"?data.products:data.products.filter(p=>p.category===activeCategory);
  $("#foodGrid").innerHTML=items.length?items.map(p=>{
    const unavailable=p.available===false, offer=p.offerPrice && Number(p.offerPrice)<Number(p.price);
    return `<article class="food-card"><div class="food-media"><img class="food-img" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">${p.badge?`<span class="food-badge">${escapeHtml(p.badge)}</span>`:''}</div><div class="food-body"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||'')}</p><div class="food-bottom"><span class="price">${offer?`<del>${money(p.price)}</del>${money(p.offerPrice)}`:money(p.price)}</span><button class="add-btn" ${unavailable?'disabled':''} onclick="addToCart(${p.id})">${unavailable?'বন্ধ':'কার্টে যোগ'}</button></div></div></article>`;
  }).join(''):'<div class="empty" style="grid-column:1/-1">এই ক্যাটাগরিতে কোনো খাবার নেই।</div>';
}
function addToCart(id){ const item=data.products.find(p=>p.id===id); if(!item||item.available===false)return; const found=cart.find(x=>x.id===id); found?found.qty++:cart.push({id,qty:1}); renderCart();openCart(); }
function renderCart(){
  $("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
  if(!cart.length) $("#cartItems").innerHTML='<div class="empty">আপনার কার্ট এখনো খালি।<br>মেনু থেকে খাবার বেছে নিন।</div>';
  else $("#cartItems").innerHTML=cart.map(c=>{const x=data.products.find(p=>p.id===c.id); if(!x)return ''; return `<div class="cart-row"><img src="${escapeHtml(x.image)}" alt="${escapeHtml(x.name)}"><div><strong>${escapeHtml(x.name)}</strong><div class="qty"><button type="button" onclick="changeQty(${x.id},-1)">−</button><span>${c.qty}</span><button type="button" onclick="changeQty(${x.id},1)">+</button></div></div><strong>${money(unitPrice(x)*c.qty)}</strong></div>`;}).join('');
  $("#cartTotal").textContent=money(cartSubtotal()); $("#checkoutTotal").textContent=money(cartSubtotal());
}
function changeQty(id,d){const x=cart.find(c=>c.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(c=>c.id!==id);renderCart();}
function openCart(){$("#cartDrawer").classList.add('open');$("#cartDrawer").setAttribute('aria-hidden','false');}
function closeCart(){$("#cartDrawer").classList.remove('open');$("#cartDrawer").setAttribute('aria-hidden','true');}
function openCheckout(){if(!cart.length){alert('প্রথমে খাবার কার্টে যোগ করুন।');return;}$("#checkoutTotal").textContent=money(cartSubtotal());closeCart();$("#checkoutModal").classList.add('open');$("#checkoutModal").setAttribute('aria-hidden','false');setTimeout(()=>$('input[name="table"]')?.focus(),120);}
function closeCheckout(){$("#checkoutModal").classList.remove('open');$("#checkoutModal").setAttribute('aria-hidden','true');}
function showWaFallback(waLink,webLink,msg){let box=document.getElementById('waFallback');if(!box){box=document.createElement('div');box.id='waFallback';box.className='checkout-modal';box.setAttribute('aria-hidden','true');box.innerHTML=`<div class="checkout-backdrop" onclick="document.getElementById('waFallback').classList.remove('open')"></div><div class="checkout-card"><div class="checkout-head"><div><span class="section-kicker">WHATSAPP</span><h3>অর্ডার পাঠান</h3></div><button type="button" onclick="document.getElementById('waFallback').classList.remove('open')">×</button></div><div style="padding:22px"><p style="margin-top:0;color:#796d65">WhatsApp খুলতে সমস্যা হলে নিচের অপশনটি ব্যবহার করুন।</p><a href="${waLink}" target="_blank" rel="noopener" class="primary-btn full-btn" style="display:block;text-align:center;margin-bottom:10px">📱 WhatsApp App / Link</a><a href="${webLink}" target="_blank" rel="noopener" class="primary-btn full-btn" style="display:block;text-align:center;background:#20150f">🌐 WhatsApp Web</a><button type="button" class="primary-btn full-btn" style="margin-top:10px;background:#eadfd2;color:#20150f" onclick="navigator.clipboard?.writeText(${JSON.stringify(msg)}).then(()=>alert('অর্ডার মেসেজ কপি হয়েছে।'))">📋 মেসেজ কপি করুন</button></div></div>`;document.body.appendChild(box);}box.classList.add('open');box.setAttribute('aria-hidden','false');}
function submitOrder(e){
  e.preventDefault(); if(!cart.length)return; const fd=new FormData(e.target); const table=String(fd.get('table')||'').trim(); if(!table){alert('টেবিল নম্বর লিখুন।');return;}
  const lines=cart.map(c=>{const x=data.products.find(p=>p.id===c.id);return `🍽️ ${x.name} × ${c.qty} = ${money(unitPrice(x)*c.qty)}`;}); const total=cartSubtotal(); const orderNo='TABLE-'+Date.now().toString().slice(-6); const name=String(fd.get('name')||'').trim(); const phone=String(fd.get('phone')||'').trim(); const note=String(fd.get('note')||'').trim();
  const msg=[`🛎️ *নতুন টেবিল অর্ডার*`,`অর্ডার: ${orderNo}`,`🪑 *টেবিল নম্বর: ${table}*`,'',...lines,'',`💰 *সর্বমোট: ${money(total)}*`,name?`👤 নাম: ${name}`:'',phone?`📱 ফোন: ${phone}`:'',note?`📝 নোট: ${note}`:'','', 'দয়া করে অর্ডারটি Confirm করুন।'].filter(Boolean).join('\n');
  const wa=String(SITE_CONFIG.WHATSAPP||'').replace(/\D/g,''); if(!wa){alert('site-config.js-এ WHATSAPP নম্বর সেট করুন।');return;} const encoded=encodeURIComponent(msg); const waLink=`https://wa.me/${wa}?text=${encoded}`; const webLink=`https://web.whatsapp.com/send?phone=${wa}&text=${encoded}`; closeCheckout(); window.open(waLink,'_blank'); setTimeout(()=>{if(document.visibilityState!=='hidden')showWaFallback(waLink,webLink,msg);},1000);
}
$("#openCart").onclick=openCart;$("#closeCart").onclick=closeCart;$("#closeCartBtn").onclick=closeCart;$("#checkoutBtn").onclick=openCheckout;$("#closeCheckout").onclick=closeCheckout;$("#closeCheckoutBtn").onclick=closeCheckout;$("#checkoutForm").onsubmit=submitOrder;render();
