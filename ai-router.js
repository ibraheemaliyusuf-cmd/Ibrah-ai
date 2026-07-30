const providers = [];

export function registerProvider(provider) {
providers.push(provider);
}

export async function askAI(prompt) {

for (const provider of providers) {

try {

const result = await provider(prompt);

if (result) {

return result;

}

} catch (e) {

console.log("Provider failed");

}

}

throw new Error("No AI provider available");

}