const algosdk = require("algosdk");

const mnemonic = process.argv.slice(2).join(" ").trim();

if (!mnemonic) {
  console.error("Provide your 25-word mnemonic.");
  process.exit(1);
}

try {
  const account = algosdk.mnemonicToSecretKey(mnemonic);

  console.log("\n=== Proto-Y Agent Wallet ===");
  console.log("Address:", account.addr);
  console.log("Secret key bytes:", account.sk.length);

  const privateKeyBase64 = Buffer.from(account.sk).toString("base64");

  console.log("\nAGENT_PRIVATE_KEY=");
  console.log(privateKeyBase64);

  console.log("\nIMPORTANT: Do NOT share this key.");
} catch (error) {
  console.error("Invalid Algorand 25-word mnemonic:");
  console.error(error.message);
  process.exit(1);
}