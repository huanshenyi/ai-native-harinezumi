# Guardrail Playground

AWS Bedrockのガードレール機能を実装・テストするNext.jsアプリケーション

## セットアップ

1. `.env.sample`をコピーして`.env`を作成
2. AWS認証情報を設定（Bedrock APIアクセス用）
3. 依存関係をインストール：
   ```bash
   npm install
   ```

## 基本コマンド

```bash
# 開発サーバー起動
npm run dev

# ガードレール作成
npm run create-guardrail

# ビューティーサロン用ガードレール作成  
npm run create-beauty-salon-guardrail
```

## 機能

- チャットUI（Reactベース）
- AWS Bedrockガードレール統合
- スタッフスケジュール取得機能