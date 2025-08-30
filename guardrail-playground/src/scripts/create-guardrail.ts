#!/usr/bin/env tsx

import {
  BedrockClient,
  CreateGuardrailCommand,
  GuardrailWordConfig,
} from "@aws-sdk/client-bedrock";

const blockedWords = ["dog", "犬"];
const blockedMessage = "ここはねこねこショップだから犬の物禁止";

async function createGuardrail() {
  const client = new BedrockClient({
    region: process.env.AWS_REGION || "us-west-2",
  });

  const wordConfigs: GuardrailWordConfig[] = blockedWords.map((word) => ({
    text: word,
    inputEnabled: true,
    outputEnabled: true,
    inputAction: "BLOCK" as const,
    outputAction: "BLOCK" as const,
  }));

  const command = new CreateGuardrailCommand({
    name: "NekoNekoShopGuardrail",
    description: "Blocks dog-related content for cat shop",
    blockedInputMessaging: blockedMessage,
    blockedOutputsMessaging: blockedMessage,
    wordPolicyConfig: {
      wordsConfig: wordConfigs,
    },
  });

  try {
    const response = await client.send(command);
    console.log("✅ Guardrail created successfully!");
    console.log(`📋 Guardrail ID: ${response.guardrailId}`);
    console.log(`📋 Guardrail ARN: ${response.guardrailArn}`);
    console.log(`🚫 Blocked words: ${blockedWords.join(", ")}`);
    console.log(`💬 Block message: ${blockedMessage}`);
    return response;
  } catch (error) {
    console.error("❌ Failed to create guardrail:", error);
    throw error;
  }
}

if (require.main === module) {
  createGuardrail()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default createGuardrail;
