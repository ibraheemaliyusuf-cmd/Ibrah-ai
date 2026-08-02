const providers = [];

/**
 * Register an AI provider.
 *
 * Provider signature:
 * async function(prompt, context) {
 *   return {
 *     provider: "Provider Name",
 *     answer: "AI response"
 *   };
 * }
 */
export function registerProvider(provider) {
  if (typeof provider !== "function") {
    throw new TypeError("Provider must be a function");
  }

  providers.push(provider);
}

/**
 * Ask the registered AI providers in order.
 *
 * The first valid response wins.
 */
export async function askAI(prompt, context = {}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Invalid AI prompt");
  }

  if (providers.length === 0) {
    throw new Error("No AI provider registered");
  }

  const errors = [];

  for (const provider of providers) {
    try {
      const result = await provider(prompt, context);

      if (
        result &&
        typeof result.answer === "string" &&
        result.answer.trim().length > 0
      ) {
        return result;
      }

      errors.push(
        new Error("Provider returned an invalid AI response")
      );
    } catch (error) {
      console.error("AI Provider failed:", error);
      errors.push(error);
    }
  }

  const error = new Error("All AI providers failed");
  error.causes = errors;

  throw error;
}