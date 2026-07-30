import {

doc,
getDoc

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { db } from "./firebase.js";

export async function checkTrial(uid){

const snap=await getDoc(doc(db,"users",uid));

if(!snap.exists()) return false;

const data=snap.data();

if(data.plan==="lifetime") return true;

const end=new Date(data.trialEndsAt);

return Date.now()<end.getTime();

}

export async function getUser(uid){

const snap=await getDoc(doc(db,"users",uid));

return snap.data();

}