import { auth, db } from "./firebase.js";

import {
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {

doc,
getDoc,
setDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const provider=new GoogleAuthProvider();

export async function loginGoogle(){

const result=await signInWithPopup(auth,provider);

const user=result.user;

const ref=doc(db,"users",user.uid);

const snap=await getDoc(ref);

if(!snap.exists()){

const end=new Date();

end.setDate(end.getDate()+3);

await setDoc(ref,{

uid:user.uid,

name:user.displayName,

email:user.email,

photo:user.photoURL,

plan:"trial",

status:"active",

createdAt:serverTimestamp(),

trialEndsAt:end,

requests:0,

history:[]

});

}

location.href="dashboard.html";

}

export function logout(){

return signOut(auth);

}

export function authState(callback){

return onAuthStateChanged(auth,callback);

}