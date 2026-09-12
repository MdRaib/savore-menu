let data = {
  brand: "SAVORÉ",
  tagline: "Chinese • Thai • Fine Dining",
  logo: "assets/logo.svg",
  whatsapp: "",
  categories: [],
  products: []
};

let cart = [];
let activeCategory = "সব";

const $ = s => document.querySelector(s);
const money = n => `৳${Number(n || 0).toLocaleString("en-US")}`;
const escapeHtml = v => String(v ?? '').replace(/[&<>'"]/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
}[c]));
function unitPrice(p){
  return (p.offerPrice && Number(p.offerPrice) < Number(p.price))
    ? Number(p.offerPrice) : Number(p.price);
}
function cartSubtotal(){
  return cart.reduce((sum,c)=>{
    const p=data.products.find(x=>x.id===c.id);
    return sum + (p ? unitPrice(p)*c.qty : 0);
  },0);
}

function applySiteData(){
  document.title = `${data.brand} — Digital Menu`;
  if ($("#navLogo")) { $("#navLogo").src = data.logo || "assets/logo.svg"; $("#navLogo").alt = data.brand; }
  if ($("#brandName")) $("#brandName").textContent = data.brand;
  if ($("#brandTagline")) $("#brandTagline").textContent = data.tagline;
  if ($("#footerBrand")) $("#footerBrand").textContent = data.brand;
  if ($("#footerTagline")) $("#footerTagline").textContent = data.tagline;
  if ($("#year")) $("#year").textContent = new Date().getFullYear();
}

function render(){
  applySiteData();
  renderCategories();
  renderProducts();
  renderCart();
}

function renderCategories(){
  const box = $("#categoryTabs");
  if (!box) return;
  const cats = ["সব", ...data.categories];
  if (!cats.includes(activeCategory)) activeCategory = "সব";
  box.innerHTML = cats.map(c =>
    `<button type="button" class="${c===activeCategory?'active':''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`
  ).join('');
  box.querySelectorAll("[data-cat]").forEach(b => {
    b.onclick = () => {
      activeCategory = b.dataset.cat;
      renderCategories();
      renderProducts();
    };
  });
}

function renderProducts(){
  const grid = $("#foodGrid");
  if (!grid) return;
  const items = activeCategory === "সব"
    ? data.products
    : data.products.filter(p => p.category === activeCategory);

  grid.innerHTML = items.length ? items.map(p => {
    const unavailable = p.available === false;
    const offer = p.offerPrice && Number(p.offerPrice) < Number(p.price);
    return `<article class="food-card">
      <div class="food-media">
        <img class="food-img" src="${escapeHtml(p.image || '')}" alt="${escapeHtml(p.name)}" loading="lazy">
        ${p.badge ? `<span class="food-badge">${escapeHtml(p.badge)}</span>` : ''}
      </div>
      <div class="food-body">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description || '')}</p>
        <div class="food-bottom">
          <span class="price">${offer ? `<del>${money(p.price)}</del>${money(p.offerPrice)}` : money(p.price)}</span>
          <button class="add-btn" ${unavailable?'disabled':''} onclick="addToCart('${String(p.id).replace(/'/g,"\\'")}')">
            ${unavailable?'বন্ধ':'কার্টে যোগ'}
          </button>
        </div>
      </div>
    </article>`;
  }).join('') : '<div class="empty" style="grid-column:1/-1">এই ক্যাটাগরিতে কোনো খাবার নেই।</div>';
}

function addToCart(id){
  const item=data.products.find(p=>String(p.id)===String(id));
  if(!item || item.available===false) return;
  const found=cart.find(x=>String(x.id)===String(id));
  found ? found.qty++ : cart.push({id:item.id,qty:1});
  renderCart();
  openCart();
}

function renderCart(){
  if ($("#cartCount")) $("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
  if (!$("#cartItems")) return;
  if (!cart.length) {
    $("#cartItems").innerHTML='<div class="empty">আপনার কার্ট এখনো খালি।<br>মেনু থেকে খাবার বেছে নিন।</div>';
  } else {
    $("#cartItems").innerHTML=cart.map(c=>{
      const x=data.products.find(p=>String(p.id)===String(c.id));
      if(!x)return '';
      return `<div class="cart-row">
        <img src="${escapeHtml(x.image)}" alt="${escapeHtml(x.name)}">
        <div><strong>${escapeHtml(x.name)}</strong>
          <div class="qty">
            <button type="button" onclick="changeQty('${String(x.id).replace(/'/g,"\\'")}',-1)">−</button>
            <span>${c.qty}</span>
            <button type="button" onclick="changeQty('${String(x.id).replace(/'/g,"\\'")}',1)">+</button>
          </div>
        </div>
        <strong>${money(unitPrice(x)*c.qty)}</strong>
      </div>`;
    }).join('');
  }
  if ($("#cartTotal")) $("#cartTotal").textContent=money(cartSubtotal());
  if ($("#checkoutTotal")) $("#checkoutTotal").textContent=money(cartSubtotal());
}

function changeQty(id,d){
  const x=cart.find(c=>String(c.id)===String(id));
  if(!x)return;
  x.qty+=d;
  if(x.qty<=0)cart=cart.filter(c=>String(c.id)!==String(id));
  renderCart();
}

function openCart(){ $("#cartDrawer")?.classList.add('open'); $("#cartDrawer")?.setAttribute('aria-hidden','false'); }
function closeCart(){ $("#cartDrawer")?.classList.remove('open'); $("#cartDrawer")?.setAttribute('aria-hidden','true'); }

function openCheckout(){
  if(!cart.length){alert('প্রথমে খাবার কার্টে যোগ করুন।');return;}
  if ($("#checkoutTotal")) $("#checkoutTotal").textContent=money(cartSubtotal());
  closeCart();
  $("#checkoutModal")?.classList.add('open');
  $("#checkoutModal")?.setAttribute('aria-hidden','false');
  setTimeout(()=>$('input[name="table"]')?.focus(),120);
}
function closeCheckout(){
  $("#checkoutModal")?.classList.remove('open');
  $("#checkoutModal")?.setAttribute('aria-hidden','true');
}

function showWaFallback(waLink,webLink,msg){
  let box=document.getElementById('waFallback');
  if(!box){
    box=document.createElement('div');
    box.id='waFallback';
    box.className='checkout-modal';
    box.setAttribute('aria-hidden','true');
    box.innerHTML=`<div class="checkout-backdrop" onclick="document.getElementById('waFallback').classList.remove('open')"></div>
      <div class="checkout-card"><div class="checkout-head"><div><span class="section-kicker">WHATSAPP</span><h3>অর্ডার পাঠান</h3></div>
      <button type="button" onclick="document.getElementById('waFallback').classList.remove('open')">×</button></div>
      <div style="padding:22px"><p style="margin-top:0;color:#796d65">WhatsApp খুলতে সমস্যা হলে নিচের অপশনটি ব্যবহার করুন।</p>
      <a href="${waLink}" target="_blank" rel="noopener" class="primary-btn full-btn" style="display:block;text-align:center;margin-bottom:10px">📱 WhatsApp App / Link</a>
      <a href="${webLink}" target="_blank" rel="noopener" class="primary-btn full-btn" style="display:block;text-align:center;background:#20150f">🌐 WhatsApp Web</a>
      <button type="button" class="primary-btn full-btn" style="margin-top:10px;background:#eadfd2;color:#20150f"
      onclick="navigator.clipboard?.writeText(${JSON.stringify(msg)}).then(()=>alert('অর্ডার মেসেজ কপি হয়েছে।'))">📋 মেসেজ কপি করুন</button></div></div>`;
    document.body.appendChild(box);
  }
  box.classList.add('open');
  box.setAttribute('aria-hidden','false');
}

function submitOrder(e){
  e.preventDefault();
  if(!cart.length)return;
  const fd=new FormData(e.target);
  const table=String(fd.get('table')||'').trim();
  if(!table){alert('টেবিল নম্বর লিখুন।');return;}

  const lines=cart.map(c=>{
    const x=data.products.find(p=>String(p.id)===String(c.id));
    return `🍽️ ${x.name} × ${c.qty} = ${money(unitPrice(x)*c.qty)}`;
  });
  const total=cartSubtotal();
  const orderNo='TABLE-'+Date.now().toString().slice(-6);
  const name=String(fd.get('name')||'').trim();
  const phone=String(fd.get('phone')||'').trim();
  const note=String(fd.get('note')||'').trim();

  const msg=[`🛎️ *নতুন টেবিল অর্ডার*`,`অর্ডার: ${orderNo}`,`🪑 *টেবিল নম্বর: ${table}*`,'',
    ...lines,'',`💰 *সর্বমোট: ${money(total)}*`,
    name?`👤 নাম: ${name}`:'',phone?`📱 ফোন: ${phone}`:'',
    note?`📝 নোট: ${note}`:'','', 'দয়া করে অর্ডারটি Confirm করুন।'].filter(Boolean).join('\n');

  const wa=String(data.whatsapp || '').replace(/\D/g,'');
  if(!wa){alert('Admin panel-এ WhatsApp নম্বর সেট করুন।');return;}

  const encoded=encodeURIComponent(msg);
  const waLink=`https://wa.me/${wa}?text=${encoded}`;
  const webLink=`https://web.whatsapp.com/send?phone=${wa}&text=${encoded}`;
  closeCheckout();
  window.open(waLink,'_blank');
  setTimeout(()=>{if(document.visibilityState!=='hidden')showWaFallback(waLink,webLink,msg);},1000);
}

async function loadLiveMenu(){
  // Local demo data is used only if Supabase is unavailable.
  if (!window.supabaseClient) {
    if (window.SITE_CONFIG) {
      data = {
        brand:SITE_CONFIG.BRAND_NAME || "SAVORÉ",
        tagline:SITE_CONFIG.TAGLINE || "",
        logo:SITE_CONFIG.LOGO || "assets/logo.svg",
        whatsapp:SITE_CONFIG.WHATSAPP || "",
        categories:[...(SITE_CONFIG.CATEGORIES || [])],
        products:(SITE_CONFIG.PRODUCTS || []).map((p,i)=>({...p,id:p.id||i+1}))
      };
    }
    render();
    return;
  }

  try {
    const db=window.supabaseClient;
    const [{data:settings,error:e1},{data:cats,error:e2},{data:products,error:e3}] =
      await Promise.all([
        db.from("restaurant_settings").select("*").eq("id",1).maybeSingle(),
        db.from("categories").select("*").order("sort_order",{ascending:true}),
        db.from("products").select("*").order("sort_order",{ascending:true})
      ]);
    if(e1||e2||e3) throw (e1||e2||e3);

    data.brand=settings?.brand_name || "SAVORÉ";
    data.tagline=settings?.tagline || "";
    data.logo=settings?.logo_url || "assets/logo.svg";
    data.whatsapp=settings?.whatsapp_number || "";
    data.categories=(cats||[]).map(x=>x.name);
    data.products=(products||[]).map(p=>({
      id:p.id,name:p.name,category:p.category_name,price:p.price,
      offerPrice:p.offer_price,image:p.image_url,badge:p.badge,
      description:p.description,available:p.available
    }));

    render();
  } catch(err) {
    console.error("SAVORÉ menu load failed:",err);
    // Keep the demo menu visible rather than leaving the page blank.
    if (window.SITE_CONFIG) {
      data = {
        brand:SITE_CONFIG.BRAND_NAME || "SAVORÉ",
        tagline:SITE_CONFIG.TAGLINE || "",
        logo:SITE_CONFIG.LOGO || "assets/logo.svg",
        whatsapp:SITE_CONFIG.WHATSAPP || "",
        categories:[...(SITE_CONFIG.CATEGORIES || [])],
        products:(SITE_CONFIG.PRODUCTS || []).map((p,i)=>({...p,id:p.id||i+1}))
      };
    }
    render();
  }
}

window.addToCart=addToCart;
window.changeQty=changeQty;
window.openCart=openCart;
window.closeCart=closeCart;
window.openCheckout=openCheckout;
window.closeCheckout=closeCheckout;
window.submitOrder=submitOrder;
window.loadLiveMenu=loadLiveMenu;

function init(){
  $("#openCart") && ($("#openCart").onclick=openCart);
  $("#closeCart") && ($("#closeCart").onclick=closeCart);
  $("#closeCartBtn") && ($("#closeCartBtn").onclick=closeCart);
  $("#checkoutBtn") && ($("#checkoutBtn").onclick=openCheckout);
  $("#closeCheckout") && ($("#closeCheckout").onclick=closeCheckout);
  $("#closeCheckoutBtn") && ($("#closeCheckoutBtn").onclick=closeCheckout);
  $("#checkoutForm") && ($("#checkoutForm").onsubmit=submitOrder);
  if (window.supabaseClient) loadLiveMenu();
}

document.addEventListener("DOMContentLoaded",init);
