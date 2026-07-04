// 💡 もしエラーが出る場合は、1行目に以下を追加してください
// /// <reference types="vite/client" />

import { mockRawEmailInbox } from './src/types/assignment';
import { extractAssignmentsFromEmails } from './src/services/OpenRouter';

async function run() {
  console.log("🚀 AIテストを開始します。メールデータを送信中...");
  
  try {
    const results = await extractAssignmentsFromEmails(mockRawEmailInbox);
    
    console.log("\n====== 🔥 AIの判定結果 ======");
    console.log(JSON.stringify(results, null, 2));
    console.log("=============================\n");
    
    if (results.length > 0) {
      console.log("🎉 成功！Amazonや就活メールを無視して、課題だけを抽出できました。");
    } else {
      console.error("⚠️ 課題が返ってきませんでした。APIキーなどを確認してください。");
    }
  } catch (error) {
    console.error("❌ 実行エラー:", error);
  }
}

run();