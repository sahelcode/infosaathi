import fs from 'fs'; import path from 'path'; import YAML from 'js-yaml';
import { fileURLToPath } from 'url';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=repo+'/src/content';
const OUT=repo+'/agent-knowledge';
const TODAY=new Date().toISOString().slice(0,10);
const tax=fs.readFileSync(repo+'/src/lib/taxonomy.ts','utf8');
const spec={}; for (const m of tax.matchAll(/(\w+): \{ bn: '([^']+)', en: '([^']+)'/g)) spec[m[1]]=m[2];
const rd=(d)=>fs.readdirSync(`${root}/${d}`).filter(f=>f.endsWith('.yaml')&&!f.startsWith('_')).map(f=>({slug:f.slice(0,-5),...YAML.load(fs.readFileSync(`${root}/${d}/${f}`,'utf8'))})).filter(x=>!x.draft);
const ds=v=>v instanceof Date?v.toISOString().slice(0,10):String(v);
const bnd=s=>String(s).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const tm=t=>{const [h,m]=t.split(':').map(Number);const p=h<5?'রাত':h<12?'সকাল':h<16?'দুপুর':h<18?'বিকাল':h<20?'সন্ধ্যা':'রাত';const h12=h%12||12;return `${p} ${bnd(h12)}${m?':'+bnd(String(m).padStart(2,'0')):'টা'}`;};
const hosp=Object.fromEntries(rd('hospitals').map(h=>[h.slug,h]));
const stripT=n=>n.replace(/^(প্রফেসর ডা\.|অধ্যাপক ডা\.|ডা\.|মেজর ডা\.|ডাঃ|Prof\. Dr\.|Dr\.|Major Dr\.|Prof\.)\s*/i,'').trim();
let o=['# InfoSaathi ডাক্তার তালিকা (ডাটাবেস)',`# সর্বশেষ হালনাগাদ: ${TODAY}`,'# প্রতিটি লাইন একজন ডাক্তার। তথ্য infosaathi.com থেকে, ফোনে যাচাই করা।','# ফরম্যাট: ID | নাম (বাংলা) | নাম (English) | বিশেষজ্ঞতা | চেম্বার ও সময় ও ফি | সিরিয়াল নম্বর | যাচাইয়ের তারিখ | পেজ',''];
const docs=rd('doctors').sort((a,b)=>a.name_en.localeCompare(b.name_en));
let i=0;
for(const d of docs){ i++;
  const ch=(d.chambers||[]).map(c=>{
    const h=c.hospital?hosp[c.hospital]:null; const place=h?h.short||h.name:(c.name+(c.address?', '+c.address:''));
    const days=Array.isArray(c.days)?c.days.join('/'):c.days;
    const f=c.fee?Object.entries(c.fee).map(([k,v])=>({visit:'ফি',new:'নতুন',old:'পুরনো',report:'রিপোর্ট'}[k])+' '+bnd(v)+' টাকা').join(', '):'ফি: কল করে জানুন';
    return `${place}${c.room?' ('+c.room+')':''}: ${days}, ${tm(c.start)} থেকে ${tm(c.end)}; ${f}`;
  }).join(' || ');
  const sr=(d.chambers||[]).flatMap(c=>c.serials||[]).map(s=>`${s.label||'সিরিয়াল'} ${s.number}${s.note?' ('+s.note+')':''}`);
  const uniq=[...new Set(sr)].join('; ');
  o.push(`D${String(i).padStart(3,'0')} | ${d.name} | ${d.name_en} | ${spec[d.specialty]||d.specialty} | ${ch} | ${uniq||'নেই'} | ${ds(d.verified)} | /doctor/${d.city}/${d.slug}/`);
}
fs.writeFileSync(OUT+'/knowledge-doctors.txt',o.join('\n'));
// hospitals
let h=[`# সর্বশেষ হালনাগাদ: ${TODAY}`,'# হাসপাতাল','# নাম | ঠিকানা | নম্বর (লেবেলসহ) | পেজ'];
for(const x of Object.values(hosp)){h.push(`${x.name} | ${x.address} | ${(x.numbers||[]).map(n=>`${n.label} ${n.number}`).join('; ')} | /hospital/${x.city}/${x.slug}/`);}
fs.writeFileSync(OUT+'/knowledge-hospitals.txt',h.join('\n'));
// universities
let u=['# InfoSaathi বিশ্ববিদ্যালয় তালিকা (ডাটাবেস)',`# সর্বশেষ হালনাগাদ: ${TODAY}`,'# "গত বছর" লেখা মান আগের চক্রের, বর্তমান নয়। বলার সময় এটা অবশ্যই জানাবে।',''];
for(const x of rd('universities').sort((a,b)=>a.name.localeCompare(b.name))){
  const q=x.quick?Object.entries(x.quick).map(([k,v])=>`${{open:'আবেদন শুরু',close:'আবেদনের শেষ',exam:'পরীক্ষা',elig:'যোগ্যতা',app_fee:'আবেদন ফি',admission_fee:'ভর্তি ফি',seats:'আসন',competition:'প্রতিযোগিতা',cost:'মোট খরচ',rank:'র‍্যাঙ্ক',classes:'ক্লাস শুরু'}[k]||k}: ${v}`).join('; '):'';
  const pr=(x.programs||[]).map(p=>p.name+(p.total_cost?` (মোট ${bnd(p.total_cost)} টাকা)`:'')).join(', ');
  u.push(`## ${x.name_bn} | ${x.name}${x.short?' ('+x.short+')':''}`,`ধরন: ${x.type}; প্রতিষ্ঠা: ${x.est}; ঠিকানা: ${x.address}; ওয়েব: ${x.web}${x.apply_url?'; আবেদন: '+x.apply_url:''}`,`নম্বর: ${(x.numbers||[]).map(n=>`${n.label} ${n.number}`).join('; ')||'নেই'}; ইমেইল: ${(x.emails||[]).map(e=>`${e.label} ${e.email}`).join('; ')||'নেই'}`,`এক নজরে: ${q||'নেই'}`,`প্রোগ্রাম: ${(x.programs||[]).length}টি (বিস্তারিত পেজে)`,`যাচাই: ${ds(x.verified)} (${x.verified_by||''}); পেজ: /university/${x.city}/${x.slug}/`,'');
}
fs.writeFileSync(OUT+'/knowledge-universities.txt',u.join('\n'));
