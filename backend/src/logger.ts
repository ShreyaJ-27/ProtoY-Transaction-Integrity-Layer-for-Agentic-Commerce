const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function getTimestamp(): string {
  return new Date().toISOString();
}

export function logPayment(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.green}${colors.bright}[PAYMENT]${colors.reset} ${msg}`);
}

export function logRisk(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.red}${colors.bright}[RISK]${colors.reset} ${msg}`);
}

export function logEconomics(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.yellow}${colors.bright}[ECONOMICS]${colors.reset} ${msg}`);
}

export function logProvider(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.cyan}${colors.bright}[PROVIDER]${colors.reset} ${msg}`);
}

export function logInfo(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.blue}${colors.bright}[INFO]${colors.reset} ${msg}`);
}

export function logAgent(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.magenta}${colors.bright}[AGENT]${colors.reset} ${msg}`);
}

export function logAlgorand(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.green}${colors.bright}[ALGORAND]${colors.reset} ${msg}`);
}

export function logX402(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.cyan}${colors.bright}[X402]${colors.reset} ${msg}`);
}

export function logOutcome(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.yellow}${colors.bright}[OUTCOME]${colors.reset} ${msg}`);
}

export function logMemory(msg: string): void {
  console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.white}${colors.bright}[MEMORY]${colors.reset} ${msg}`);
}
