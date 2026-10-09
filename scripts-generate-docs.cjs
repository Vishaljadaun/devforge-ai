const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
function load(file){const src=fs.readFileSync(path.join(__dirname,'src/data',file),'utf8');const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const module={exports:{}};Function('module','exports',js)(module,module.exports);return module.exports;}
const {modules,allTopics,phases}=load('curriculum.ts');const {projects}=load('projects.ts');const {flashcards,quiz}=load('revision.ts');const {lessons}=load('lessons.ts');
if(modules.length!==25||allTopics.length!==323||projects.length!==14||Object.keys(lessons).length!==8)throw Error('Catalog content count unexpected');
const moduleIds=new Set(modules.map(m=>m.id)),topicIds=new Set(allTopics.map(t=>t.id));
for(const p of projects)for(const id of p.skills)if(!moduleIds.has(id))throw Error(`Unknown project skill: ${id}`);
for(const c of flashcards)if(!moduleIds.has(c.moduleId))throw Error(`Unknown card skill: ${c.moduleId}`);
for(const id of Object.keys(lessons))if(!topicIds.has(id))throw Error(`Unknown lesson topic: ${id}`);
let result=['# Complete AI Engineering Roadmap','',`**${modules.length} modules · ${allTopics.length} tracked topics · ${projects.length} guided projects · ${flashcards.length} revision cards · ${quiz.length} quiz questions · ${Object.keys(lessons).length} written starter lessons**`,'','This file is the complete syllabus index. Most topics are outlines with links and a hands-on lab, not long-form written lessons yet. Use the DevForge website for progress, bookmarks and revision.',''];
for(const phase of phases){result.push(`## ${phase}`,'');for(const m of modules.filter(x=>x.phase===phase)){result.push(`### ${m.title}`,'',`${m.subtitle} · ${m.level} · suggested ${m.weeks} week(s)`,'',...m.topics.map((t,i)=>`- [ ] ${i+1}. ${t}`),'',`**Hands-on lab:** ${m.lab}`,'',`**Outcome:** ${m.outcome}`,'',`**References:** ${m.resources.map(r=>`[${r.title}](${r.url})`).join(' · ')}`,'');}}
fs.writeFileSync(path.join(__dirname,'docs/COMPLETE_ROADMAP.md'),result.join('\n'));
let pg=['# Project-by-project AI Engineering Guide','',`These ${projects.length} outlines are not complete working applications. Every project has checkable milestones in the live DevForge dashboard.`,''];
for(const [i,p] of projects.entries()){pg.push(`## ${i+1}. ${p.title}`,'',`**${p.difficulty} · ${p.duration} · ${p.category}**`,'',p.build,'',`**Stack:** ${p.stack.join(', ')}`,'',`**Skills:** ${p.skills.map(id=>modules.find(m=>m.id===id).title).join(', ')}`,'',...p.milestones.map(t=>`- [ ] ${t}`),'',`**Deliverable:** ${p.deliverable}`,'');}
fs.writeFileSync(path.join(__dirname,'docs/PROJECT_GUIDES.md'),pg.join('\n'));
console.log(`VALIDATION OK: ${modules.length} modules; ${allTopics.length} topics; ${projects.length} projects; ${flashcards.length} flashcards; ${quiz.length} quiz questions; ${Object.keys(lessons).length} lessons; all content links valid.`);
