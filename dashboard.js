import { auth, db } from "./firebase.js";

import {

doc,

getDoc

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {

onAuthStateChanged,

signOut

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const name=document.getElementById("name");

const email=document.getElementById("email");

const photo=document.getElementById("photo");

const plan=document.getElementById("plan");

const status=document.getElementById("status");

const requests=document.getElementById("requests");

const trial=document.getElementById("trial");

const logout=document.getElementById("logout");

logout.onclick=()=>{

signOut(auth);

location.href="login.html";

};

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

const snap=await getDoc(doc(db,"users",user.uid));

const data=snap.data();

name.innerHTML=data.name;

email.innerHTML=data.email;

photo.src=data.photo;

plan.innerHTML=data.plan;

status.innerHTML=data.status;

requests.innerHTML=data.requests;

const end=new Date(data.trialEndsAt);

const days=Math.ceil(

(end-Date.now())/86400000

);

trial.innerHTML=days+" يوم";

});

import { askAI } from "./ai-router.js";

const send=document.getElementById("sendAI");

const prompt=document.getElementById("prompt");

const response=document.getElementById("response");

send.onclick=async()=>{

response.innerHTML="جاري التفكير...";

try{

const result=await askAI(prompt.value);

response.innerHTML=result.answer;

}catch(e){

response.innerHTML="حدث خطأ.";

}

};