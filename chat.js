import { API_URL } from "./config.js";

const messages = document.getElementById("messages");
const input = document.getElementById("message");
const send = document.getElementById("send");

function addMessage(text, type) {

    const div = document.createElement("div");

    div.className = type;

    div.textContent = text;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;

}

send.onclick = async () => {

    const prompt = input.value.trim();

    if (!prompt) return;

    addMessage(prompt, "user");

    input.value = "";

    const loading = document.createElement("div");

    loading.className = "ai";

    loading.textContent = "⏳ جاري التفكير...";

    messages.appendChild(loading);

    messages.scrollTop = messages.scrollHeight;

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                model: "deepseek/deepseek-chat-v3-0324:free",

                messages: [

                    {

                        role: "user",

                        content: prompt

                    }

                ]

            })

        });

        const data = await response.json();

        loading.textContent = data.choices[0].message.content;

    } catch (e) {

        loading.textContent = "❌ حدث خطأ في الاتصال بالخادم.";

        console.error(e);

    }

};