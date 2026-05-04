import Valkey from "iovalkey";

const valkey = new Valkey({
  host: process.env.VALKEY_HOST ?? "localhost",
  port: Number(process.env.VALKEY_PORT ?? 6379),
  password: process.env.VALKEY_PASSWORD ?? undefined,
  tls: process.env.NODE_ENV === "production" ? {} : undefined,
  // Reconexão automática com backoff exponencial
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  lazyConnect: true,
});

valkey.on("connect", () => console.log("[Valkey] Conectado"));
valkey.on("error", (err) => console.error("[Valkey] Erro:", err));

export default valkey;
