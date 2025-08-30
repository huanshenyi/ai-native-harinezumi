import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  type InferUITools,
} from "ai";
import { getStaffSchedule } from "@/tools/get-staff-schedule";
import { randomUUID } from "crypto";
import { Langfuse } from "langfuse";

const bedrock = createAmazonBedrock({
  region: process.env.BEDROCK_REGION || "us-west-2",
  accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID,
  secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY,
  sessionToken: process.env.BEDROCK_SESSION_TOKEN,
});

const tools = {
  getStaffSchedule,
};
export type ChatTools = InferUITools<typeof tools>;

const systemPrompt = `
あなたは「Hair Salon MIKA」の予約受付AIアシスタントです。
## 店舗情報
- 店舗名: Hair Salon MIKA
- 営業時間: 10:00-19:00（最終受付18:00）
- 定休日: 月曜日
- 所在地: 東京都渋谷区

## スタッフ情報
### 田中美香（店長・スタイリスト）
- 経験年数: 15年
- 得意分野: カット、カラー、パーマ、ヘアセット
- 指名料: +1,000円

### 佐藤裕子（スタイリスト）
- 経験年数: 8年
- 得意分野: カット、カラー、トリートメント
- 指名料: +500円

## サービスメニュー
- カット: 4,500円（60分）
- カラー: 6,500円（90分）
- パーマ: 8,500円（120分）
- カット+カラー: 10,000円（120分）
- トリートメント: 3,500円（45分）
- ヘアセット: 3,000円（45分）

## 重要な指示
- お客様のご希望日時を確認したら、必ずgetStaffScheduleツールを使用してスケジュールを確認してください
- 空き時間を見つけたら、具体的な時間枠を提案してください
- 予約が取れない場合は、代替の日時を提案してください

## 回答スタイル
- 丁寧で親しみやすい接客口調
- お客様のご希望を詳しくお聞きする
- 利用可能な時間枠を具体的に提案
- 料金とサービス内容を明確に説明
- 必要に応じてスタイリストの特徴を紹介

## 予約受付の流れ
1. ご希望のサービス内容を確認
2. ご希望の日時・スタイリストを確認
3. getStaffScheduleツールで空き時間を確認
4. 利用可能な時間枠を案内・調整
5. お客様情報（お名前・電話番号）を確認
6. 予約内容の最終確認

あなたはお客様に寄り添い、最適な予約案内を提供することを心がけてください。
`;

const langfuse = new Langfuse();
const parentTraceId = randomUUID();

const trace = langfuse.trace({
  id: parentTraceId,
  name: "hair-salon-reservation",
});
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: bedrock("us.anthropic.claude-sonnet-4-20250514-v1:0"),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    experimental_telemetry: {
      isEnabled: true,
      functionId: "hair-salon-reservation",
      metadata: {
        langfuseTraceId: parentTraceId,
        langfuseUpdateParent: false,
      },
    },
    tools,
    providerOptions: {
      bedrock: {
        guardrailConfig: {
          guardrailIdentifier: process.env.GUARDRAILIDENTIFIER as string,
          guardrailVersion: "1",
          trace: "enabled" as const,
          streamProcessingMode: "async",
        },
      },
    },
  });

  // Guardrail trace を Langfuse に統合
  result.providerMetadata
    .then((metadata) => {
      trace.update({
        output: {
          type: "json",
          value: metadata?.bedrock.trace,
        },
      });
    })
    .catch((err) => {
      console.error("Failed to get metadata:", err);
    });
  await langfuse.flushAsync();
  await langfuse.shutdownAsync();

  return result.toUIMessageStreamResponse();
}
