(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function a(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=a(e);fetch(e.href,t)}})();document.getElementById("uploadForm").addEventListener("submit",async c=>{c.preventDefault();const r=c.target,a=new FormData(r),o=document.getElementById("loading"),e=document.getElementById("results"),t=document.getElementById("jobsList");try{o.classList.remove("hidden"),e.classList.add("hidden");const s=await fetch("/.netlify/functions/process-jobs",{method:"POST",body:a}),n=await s.json();if(s.ok)t.innerHTML="",n.jobs&&n.jobs.length>0?n.jobs.forEach(i=>{const l=document.createElement("div");l.className="bg-gray-50 p-4 rounded-lg",l.innerHTML=`
                                <h3 class="font-semibold">${i.title}</h3>
                                <p class="text-gray-600">${i.company}</p>
                                <p class="text-gray-500">${i.location}</p>
                                <div class="mt-2">
                                    <span class="text-green-600">Match Score: ${i.matchDetails.matchScore}%</span>
                                </div>
                                <a href="${i.link}" target="_blank" 
                                   class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
                                    View Job
                                </a>
                            `,t.appendChild(l)}):t.innerHTML=`<p class="text-gray-600">${n.message}</p>`,e.classList.remove("hidden");else throw new Error(n.error||"Failed to process files")}catch(s){alert(s.message)}finally{o.classList.add("hidden")}});
