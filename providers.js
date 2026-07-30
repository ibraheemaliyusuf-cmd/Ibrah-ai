import { APP } from "./config.js";
import { registerProvider } from "./ai-router.js";

async function openRouter(prompt){

const response = await fetch("https://openrouter.ai/api/v1/chat/completions",{

method:"POST",

headers:{

"Authorization":"Bearer "+APP.OPENROUTER_API_KEY,

"Content-Type":"application/json"

},

body:JSON.stringify({

model:APP.MODEL,

messages:[

{

role:"user",

content:prompt

}

]

})

});

if(!response.ok){

throw new Error("OpenRouter Error");

}

const json=await response.json();

return{

provider:"OpenRouter",

answer:json.choices[0].message.content

};

}

registerProvider(openRouter);