import dotenv from 'dotenv';
import { ProviderOption } from './types.js';

dotenv.config();

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set in backend/.env`);
  }
  return value;
}

export const PORT = parseInt(process.env.PORT || '4021', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';

export const AVM_ADDRESS = requiredEnv('AVM_ADDRESS');

export const ALGORAND_CONFIG = {
  network: process.env.ALGORAND_NETWORK || 'testnet',
  nodeUrl: process.env.ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud',
  networkId: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
};

export const USDC_CONFIG = {
  asaId: parseInt(process.env.USDC_ASA_ID || '10458941', 10),
  decimals: parseInt(process.env.USDC_DECIMALS || '6', 10)
};

export const FACILITATOR_CONFIG = {
  url: process.env.FACILITATOR_URL || 'https://facilitator.goplausible.xyz'
};

export const PRICE_MAP = {
  INTENT: parseInt(process.env.PRICE_INTENT_ANALYSIS || '10000', 10),
  ECONOMICS: parseInt(process.env.PRICE_ECONOMICS_CHECK || '15000', 10),
  PROVIDER: parseInt(process.env.PRICE_PROVIDER_SELECT || '5000', 10),
  RESEARCH: parseInt(process.env.PRICE_RESEARCH_API || '50000', 10)
};

export const PROVIDER_DATABASE: ProviderOption[] = [
  {
    id: 'weather-api',
    name: 'OpenWeather',
    reputation: 0.95,
    price: 10000,
    sla: 99.9,
    healthStatus: 'healthy'
  },
  {
    id: 'ai-research',
    name: 'AI Analysis',
    reputation: 0.88,
    price: 50000,
    sla: 95.0,
    healthStatus: 'healthy'
  },
  {
    id: 'data-feed',
    name: 'Data Feed',
    reputation: 0.92,
    price: 25000,
    sla: 99.5,
    healthStatus: 'healthy'
  }
];
