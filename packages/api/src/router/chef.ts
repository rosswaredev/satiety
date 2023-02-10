import { Configuration, OpenAIApi } from "openai";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const prompt = (ingredients: string[]) => `
Act as my personal chef. Given a list of ingredients, reply with three recipes for me to try. If you can\'t think of a recipe, respond with a "?" instead.
Assume basic ingredients like salt, pepper, and spices are available.
Do not include substantial ingredients that are not listed in the request.

Request: steak, butter, eggs, milk, brocolli, cheese, chicken
Response: Steak with Broccoli and Cheese Sauce, Broccoli Cheese Bake, Buttermilk Biscuits
Request: ${ingredients.join(", ")}
Response:',
`;

export const chefRouter = createTRPCRouter({
  suggestRecipes: publicProcedure
    .input(z.object({ ingredients: z.array(z.string()) }))
    .output(z.array(z.string()))
    .mutation(async ({ input }) => {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt(input.ingredients),
        temperature: 0.3,
        max_tokens: 120,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return response.data.choices
        .map((choice) => choice.text ?? "")
        .join("")
        .split(", ");
    }),
});
