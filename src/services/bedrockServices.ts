import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: "ap-south-1",
});

const MODEL_ID = "nvidia.nemotron-nano-12b-v2";

export async function askBedrock(prompt: string) {
  const command = new ConverseCommand({
    modelId: MODEL_ID,
    messages: [
      {
        role: "user",
        content: [
          {
            text: prompt,
          },
        ],
      },
    ],
  });

  const response = await client.send(command);

  return response.output?.message?.content?.[0]?.text ?? "";
}
