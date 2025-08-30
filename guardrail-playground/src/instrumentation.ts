export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("Registering OpenTelemetry for Next.js");
    const { registerOTel } = await import("@vercel/otel");
    const { LangfuseExporter } = await import("langfuse-vercel");

    registerOTel({
      serviceName: "langfuse-vercel-ai-nextjs-example",
      traceExporter: new LangfuseExporter({
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        baseUrl: process.env.LANGFUSE_BASEURL,
      }),
    });
  }
}
