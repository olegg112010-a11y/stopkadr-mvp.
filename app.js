const $ = (s) => document.querySelector(s);
const modal = $("#accountModal");
const profileForm = $("#profileForm");
const dashboard = $("#dashboard");
const profileStatus = $("#profileStatus");
const toast = $("#toast");
const STORAGE = "creator_mvp_demo_v1";
const SUBMISSIONS = "creator_mvp_submissions_v1";
let currentFilter = "all";
let currentUser = null;

function getUser(){ try{return JSON.parse(localStorage.getItem(STORAGE)||"null")}catch{return null} }
function getSubmissions(){ try{return JSON.parse(localStorage.getItem(SUBMISSIONS)||"[]")}catch{return []} }
function saveSubmissions(items){localStorage.setItem(SUBMISSIONS,JSON.stringify(items))}
function notify(message){toast.textContent=message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2800)}
function openModal(){modal.hidden=false;document.body.style.overflow="hidden";refreshAccount()}
function closeModal(){modal.hidden=true;document.body.style.overflow=""}
$("#openAccount").addEventListener("click",openModal);
$("#joinCreator").addEventListener("click",openModal);
$("#closeModal").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

function refreshAccount(){
  currentUser=getUser();
  if(currentUser){
    profileForm.hidden=true;profileStatus.textContent="";
    dashboard.hidden=false;
    $("#welcomeText").textContent=`Привет, ${currentUser.nickname}! Здесь можно отправить работу на модерацию.`;
    renderSubmissions();
  }else{
    profileForm.hidden=false;dashboard.hidden=true;
    profileStatus.textContent="";
  }
}
profileForm.addEventListener("submit",e=>{
  e.preventDefault();
  const fd=new FormData(profileForm);
  const user={nickname:String(fd.get("nickname")).trim(),email:String(fd.get("email")).trim(),bio:String(fd.get("bio")||"").trim(),createdAt:new Date().toISOString()};
  localStorage.setItem(STORAGE,JSON.stringify(user));
  currentUser=user;
  profileStatus.textContent="Демо-профиль создан в этом браузере.";
  refreshAccount();
  notify("Профиль создан в демо-режиме");
});

$("#uploadForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!currentUser){notify("Сначала создай профиль");return}
  const form=e.currentTarget, fd=new FormData(form), file=fd.get("photo");
  if(!file || !file.size){notify("Выбери фотографию");return}
  if(file.size>5*1024*1024){notify("Файл должен быть меньше 5 МБ");return}
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)){notify("Поддерживаются JPG, PNG и WebP");return}
  const reader=new FileReader();
  reader.onload=()=>{
    const item={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),nickname:currentUser.nickname,title:String(fd.get("title")).trim(),category:String(fd.get("category")),description:String(fd.get("description")||"").trim(),image:reader.result,status:"На модерации",createdAt:new Date().toISOString()};
    const all=getSubmissions();all.unshift(item);saveSubmissions(all);
    form.reset();renderSubmissions();notify("Работа отправлена на модерацию");
  };
  reader.readAsDataURL(file);
});
function renderSubmissions(){
  const wrap=$("#mySubmissions"), mine=getSubmissions().filter(x=>x.nickname===currentUser?.nickname);
  wrap.innerHTML=mine.length?'<h3>Мои отправленные работы</h3>':"";
  mine.forEach(item=>{
    const el=document.createElement("div");el.className="submission";
    const img=document.createElement("img");img.src=item.image;img.alt="Превью отправленной работы";
    const info=document.createElement("div");const title=document.createElement("b");title.textContent=item.title;
    const small=document.createElement("small");small.textContent=item.status+" · "+new Date(item.createdAt).toLocaleDateString("ru-RU");
    info.append(title,small);el.append(img,info);wrap.append(el);
  });
}
$("#logout").addEventListener("click",()=>{localStorage.removeItem(STORAGE);currentUser=null;refreshAccount();notify("Вы вышли из демо-профиля")});

document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");currentFilter=btn.dataset.filter;renderGallery();
}));
function renderGallery(){
  const gallery=$("#gallery");
  const approved=getSubmissions().filter(x=>x.status==="Одобрено"&&(currentFilter==="all"||x.category===currentFilter));
  $("#catalogCount").textContent=`${approved.length} ${approved.length===1?"коллекция":"коллекций"}`;
  gallery.innerHTML="";
  if(!approved.length){
    const empty=document.createElement("div");empty.className="empty-state";
    empty.innerHTML='<div class="empty-icon">✿</div><h3>Каталог готов к первым авторам</h3><p>Здесь появятся одобренные фотографии. Стань одним из первых участников проекта.</p><a class="btn btn-light" href="#creators">Подать заявку</a>';
    gallery.append(empty);return;
  }
  approved.forEach(item=>{
    const card=document.createElement("article");card.className="photo-card";
    const img=document.createElement("img");img.src=item.image;img.alt="Фотография из коллекции "+item.title;img.style.cssText="width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:14px";
    const h=document.createElement("h3");h.textContent=item.title;
    const p=document.createElement("p");p.textContent="Автор: "+item.nickname+" · Бесплатный каталог";
    card.append(img,h,p);gallery.append(card);
  });
}
renderGallery();
refreshAccount();

// Demo only: localStorage is not secure, files never leave this browser, and this is not production authentication or moderation.
