import {
  BedrockClient,
  CreateGuardrailCommand,
  CreateGuardrailCommandInput,
  CreateGuardrailCommandOutput,
} from "@aws-sdk/client-bedrock";

async function createBeautySalonGuardrail(): Promise<CreateGuardrailCommandOutput> {
  const client = new BedrockClient({
    region: "us-west-2",
  });

  const input: CreateGuardrailCommandInput = {
    name: "beauty-salon-guardrail",
    description:
      "美容室予約システム用のガードレール - 予約関連以外の話題とPII情報をブロック",

    // ブロックされた際のメッセージ
    blockedInputMessaging:
      "申し訳ございませんが、用途以外の回答ができません。美容室の予約に関するご質問をお願いいたします。",
    blockedOutputsMessaging:
      "申し訳ございませんが、用途以外の回答ができません。美容室の予約に関するご質問をお願いいたします。",

    // Cross-Region inference設定
    crossRegionConfig: {
      guardrailProfileIdentifier: "us.guardrail.v1:0",
    },

    // 拒否されたトピック設定 - 美容室予約以外の話題をブロック
    topicPolicyConfig: {
      tierConfig: {
        tierName: "STANDARD",
      },
      topicsConfig: [
        {
          name: "GeneralChit-Chat",
          type: "DENY",
          definition:
            "日常会話、雑談、世間話、趣味の話題など、美容室の予約や施術に関係のない一般的な会話内容",
          examples: [
            "今日の天気はどうですか？",
            "最近のニュースについて教えて",
            "おすすめの映画は何ですか？",
            "料理のレシピを教えて",
            "政治について話しましょう",
          ],
          inputEnabled: true,
          inputAction: "BLOCK",
          outputEnabled: true,
          outputAction: "BLOCK",
        },
        {
          name: "Technology-Programming",
          type: "DENY",
          definition:
            "プログラミング、IT技術、ソフトウェア開発、コンピューター関連の質問や話題",
          examples: [
            "Pythonのコードを書いて",
            "データベースの設計方法",
            "機械学習について教えて",
            "ウェブサイトの作り方",
            "AIの仕組みについて",
          ],
          inputEnabled: true,
          inputAction: "BLOCK",
          outputEnabled: true,
          outputAction: "BLOCK",
        },
        {
          name: "Academic-Research",
          type: "DENY",
          definition:
            "学術研究、論文執筆、大学の課題、学習の代行など教育・研究関連の依頼",
          examples: [
            "論文を書いて",
            "宿題を手伝って",
            "研究データの分析",
            "レポートの作成",
          ],
          inputEnabled: true,
          inputAction: "BLOCK",
          outputEnabled: true,
          outputAction: "BLOCK",
        },
      ],
    },

    // 機密情報（PII）フィルター設定
    sensitiveInformationPolicyConfig: {
      // 個人識別情報のブロック
      piiEntitiesConfig: [
        {
          type: "PASSWORD",
          action: "BLOCK",
        },
        {
          type: "CREDIT_DEBIT_CARD_NUMBER",
          action: "BLOCK",
        },
        {
          type: "CREDIT_DEBIT_CARD_CVV",
          action: "BLOCK",
        },
        {
          type: "US_SOCIAL_SECURITY_NUMBER",
          action: "BLOCK",
        },
        {
          type: "US_PASSPORT_NUMBER",
          action: "BLOCK",
        },
        {
          type: "DRIVER_ID",
          action: "BLOCK",
        },
        {
          type: "US_BANK_ACCOUNT_NUMBER",
          action: "BLOCK",
        },
        {
          type: "US_BANK_ROUTING_NUMBER",
          action: "BLOCK",
        },
        {
          type: "PIN",
          action: "BLOCK",
        },
        {
          type: "AWS_ACCESS_KEY",
          action: "BLOCK",
        },
        {
          type: "AWS_SECRET_KEY",
          action: "BLOCK",
        },
      ],

      // カスタム正規表現フィルター（国内の個人情報）
      regexesConfig: [
        {
          name: "Japanese-MyNumber",
          description: "マイナンバー",
          pattern: "\\b\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b",
          action: "BLOCK",
        },
      ],
    },
  };

  try {
    const command = new CreateGuardrailCommand(input);
    const response = await client.send(command);

    console.log(
      "✅ 美容室ガードレール（Standard tier + Cross-Region inference）が正常に作成されました!"
    );
    console.log(`ガードレールID: ${response.guardrailId}`);
    console.log(`ガードレールARN: ${response.guardrailArn}`);
    console.log(`バージョン: ${response.version}`);
    console.log(`guardrailIdentifier: "${response.guardrailId}"`);
    console.log(`guardrailVersion: "${response.version}"`);

    return response;
  } catch (error) {
    console.error("❌ ガードレール作成中にエラーが発生しました:", error);
    throw error;
  }
}

if (require.main === module) {
  createBeautySalonGuardrail()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default createBeautySalonGuardrail;
