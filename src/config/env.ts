import { z } from "zod";

// Variables publicas: Next las incrusta en el bundle en tiempo de build,
// por eso cada una se lee con `process.env.NOMBRE` literal.
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
