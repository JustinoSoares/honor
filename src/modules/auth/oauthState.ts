import valkey from '../../config/valkey';
import crypto from 'crypto';

const STATE_PREFIX = 'oauth:state:';
const STATE_TTL_SECONDS = 10 * 60; // 10 minutos

export async function generateState(): Promise<string> {
  const state = crypto.randomBytes(16).toString('hex');
  // SET oauth:state:<value> 1 EX 600
  // EX define TTL — o Valkey apaga automaticamente após 10 min
  await valkey.set(`${STATE_PREFIX}${state}`, '1', 'EX', STATE_TTL_SECONDS);
  return state;
}

export async function consumeState(state: string): Promise<boolean> {
  // GETDEL: lê e deleta atomicamente — one-time use, sem race condition
  const result = await valkey.getdel(`${STATE_PREFIX}${state}`);
  return result === '1';
}