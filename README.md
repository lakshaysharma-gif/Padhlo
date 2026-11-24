# Padhlo AI

Create a responsive React + TypeScript website called Padhlo AI. Build a modern landing page with a navigation bar, hero section, feature cards, and a study planner form. Allow students to enter subjects, difficulty levels, preparation percentages, exam dates, and available study hours. Use a clean dashboard design with blue and white colors. Create a functional frontend with modular components and sample study-plan data. Do not integrate any external APIs yet. Ensure all starter files are generated and saved successfully.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e4892acf-47e4-413e-b7df-d6e919f00fc3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## Enable the Padhlo AI chatbot

The chatbot uses the OpenAI Responses API from a server route. Your API key stays on the server and is never sent to the browser.

1. Copy `.env.example` to a new file named `.env` in the project root.
2. Add your OpenAI API key to `OPENAI_API_KEY` in `.env`.
3. Keep `OPENAI_MODEL=gpt-6-luna` (or choose another model your API account can access).
4. Restart the development server with `npm run dev`.

You need an OpenAI API key with API billing/access enabled. ChatGPT subscriptions and API billing are separate. Never commit `.env` or expose your key in frontend code.
