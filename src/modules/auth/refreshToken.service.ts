import valkey from "../../config/valkey";

const RT_PREFIX = "refresh:";
const RT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias

// Salva no Valkey com TTL idêntico ao JWT
export async function storeRefreshToken(user_id: string, token: string): Promise<void> {
  // Chave: refresh:<user_id> → valor: o token
  // Se o usuário fizer login de novo, sobrescreve (sessão única por usuário)
  await valkey.set(`${RT_PREFIX}${user_id}`, token, "EX", RT_TTL_SECONDS);
}

// Verifica se o token é válido e pertence ao user_id
export async function validateRefreshToken(user_id: string, token: string): Promise<boolean> {
  const stored = await valkey.get(`${RT_PREFIX}${user_id}`);
  return stored === token;
}

// Revoga a sessão do usuário instantaneamente
export async function revokeRefreshToken(user_id: string): Promise<void> {
  await valkey.del(`${RT_PREFIX}${user_id}`);
}

// Revoga por token (útil no logout quando não temos o user_id facilmente)
export async function revokeByToken(token: string, user_id: string): Promise<void> {
  const stored = await valkey.get(`${RT_PREFIX}${user_id}`);
  if (stored === token) {
    await valkey.del(`${RT_PREFIX}${user_id}`);
  }
}
