import { StandardCheckoutClient, Env } from "@phonepe-pg/pg-sdk-node";

let phonePeClientInstance: StandardCheckoutClient | null = null;

/**
 * Returns a singleton instance of standard PhonePe checkout client.
 */
export function getPhonePeClient(): StandardCheckoutClient {
  if (!phonePeClientInstance) {
    const clientId = process.env.PHONEPE_CLIENT_ID || "";
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET || "";
    const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || "1", 10);
    const envStr = (process.env.PHONEPE_ENV || "SANDBOX").toUpperCase();
    const env = envStr === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

    if (!clientId || !clientSecret) {
      throw new Error(
        "PhonePe client configuration error: PHONEPE_CLIENT_ID or PHONEPE_CLIENT_SECRET is missing."
      );
    }

    phonePeClientInstance = StandardCheckoutClient.getInstance(
      clientId,
      clientSecret,
      clientVersion,
      env
    );
  }

  return phonePeClientInstance;
}

/**
 * Returns PhonePe configuration details including Webhook Basic Auth credentials.
 */
export function getPhonePeConfig() {
  const clientId = process.env.PHONEPE_CLIENT_ID || "";
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET || "";
  const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || "1", 10);
  const envStr = (process.env.PHONEPE_ENV || "SANDBOX").toUpperCase();
  const env = envStr === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;
  const username = process.env.PHONEPE_USERNAME || "";
  const password = process.env.PHONEPE_PASSWORD || "";

  return {
    clientId,
    clientSecret,
    clientVersion,
    env,
    username,
    password,
  };
}
