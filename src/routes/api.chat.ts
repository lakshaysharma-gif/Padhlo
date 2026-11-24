
import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Read the server-side environment variable
          const rawKey = process.env.GROQ_API_KEY;

          // Clean accidental spaces or surrounding quotes
          const apiKey = rawKey?.trim().replace(/^["']|["']$/g, "");

          if (!apiKey) {
            console.error("GROQ_API_KEY is missing from server environment.");

            return Response.json(
              {
                error: "AI service is not configured. Please check the server environment variables.",
              },
              { status: 500 },
            );
          }

          // Use a currently supported model
          const model =
            process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b";

          // Parse request body
          const body = (await request.json()) as {
            messages?: ChatMessage[];
            subjects?: {
              name: string;
              difficulty: string;
              preparation: number;
            }[];
          };

          // Keep only the most recent messages
          const messages = Array.isArray(body.messages)
            ? body.messages.slice(-12)
            : [];

          // Validate and sanitize messages
          const safeMessages = messages
            .filter(
              (item) =>
                item &&
                (item.role === "user" || item.role === "assistant") &&
                typeof item.text === "string",
            )
            .map((item) => ({
              role: item.role,
              content: item.text.slice(0, 3000),
            }));

          if (
            safeMessages.length === 0 ||
            safeMessages[safeMessages.length - 1].role !== "user"
          ) {
            return Response.json(
              { error: "Please enter a message to continue." },
              { status: 400 },
            );
          }

          // Build student subject context
          const subjectContext = Array.isArray(body.subjects)
            ? body.subjects
                .slice(0, 20)
                .map(
                  (subject) =>
                    `${String(subject.name).slice(0, 80)} (${String(
                      subject.difficulty,
                    )}, ${Number(subject.preparation)}% prepared)`,
                )
                .join(", ")
            : "No subjects added yet";

          // Send request to Groq
          const upstream = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  {
                    role: "system",
                    content: `You are Padhlo AI, a friendly and practical study coach for students.

Give clear, encouraging, age-appropriate study guidance.
Use concise steps, realistic schedules, active recall, spaced repetition, and breaks where relevant.
Do not claim to know facts about the student beyond this context.

The student's current subjects: ${subjectContext}.`,
                  },
                  ...safeMessages,
                ],
                temperature: 0.7,
                max_tokens: 800,
              }),
            },
          );

          // Parse upstream response safely
          const responseText = await upstream.text();

          let result: any;

          try {
            result = JSON.parse(responseText);
          } catch {
            result = { raw: responseText };
          }

          // Detailed server-side error logging
          if (!upstream.ok) {
            console.error("========== GROQ API ERROR ==========");
            console.error("HTTP Status:", upstream.status);
            console.error("Model:", model);
            console.error("Error response:", result);
            console.error("==================================");

            let message = "Groq AI request failed.";

            if (upstream.status === 401) {
              message =
                "Groq rejected the API key. Check the GROQ_API_KEY in Vercel.";
            } else if (upstream.status === 403) {
              message =
                "Groq denied access. Check your API account permissions.";
            } else if (upstream.status === 404) {
              message =
                "The selected Groq model was not found. Check the GROQ_MODEL variable.";
            } else if (upstream.status === 429) {
              message =
                "Groq rate limit reached. Please wait and try again.";
            } else if (upstream.status >= 500) {
              message =
                "Groq's service is temporarily unavailable. Please try again.";
            }

            return Response.json(
              { error: message },
              { status: upstream.status === 401 ? 401 : 502 },
            );
          }

          // Extract AI response
          const reply =
            result?.choices?.[0]?.message?.content?.trim();

          if (!reply) {
            console.error("Groq returned no message content:", result);

            return Response.json(
              { error: "The AI returned an empty response. Please try again." },
              { status: 502 },
            );
          }

          return Response.json({ reply });
        } catch (error) {
          console.error("Padhlo AI API route error:", error);

          return Response.json(
            { error: "Something went wrong while contacting the AI." },
            { status: 500 },
          );
        }
      },
    },
  },
});
