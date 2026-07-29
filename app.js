import {

loginGoogle,
authState

} from "./auth.js";

const login=document.getElementById("googleLogin");

if(login){

login.onclick=()=>{

loginGoogle();

};

}

authState(user=>{

if(user){

console.log("Logged:",user.email);

}

});