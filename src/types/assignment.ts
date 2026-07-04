import { Assignment } from './assignment';

// OpenRouterの基本設定
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ハッカソンで動かす際は、一時的にここに直接キーを貼り付けてもOKです
// （GitHub等にパブリックにプッシュしないよう注意してください）
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY_HERE";
const MODEL_NAME = 'google/gemini-2.5-flash';

/**
 * 混在したメールボックスのデータから「課題」だけをAIに判定させ、構造化データとして抽出する関数
 * @param rawEmails 件名と本文を持つ未整理のメールオブジェクトの配列
 */
export async function extractAssignmentsFromEmails(
  rawEmails: { subject: string; body: string }[]
): Promise<Assignment[]> {
  
  if (OPENROUTER_API_KEY === "YOUR_OPENROUTER_API_KEY_HERE" || !OPENROUTER_API_KEY) {
    console.error("⚠️ OpenRouterのAPIキーが設定されていません。コード内か環境変数に設定してください。");
    return [];
  }

  // 1. AIへの命令文（プロンプト）を作成
  const prompt = `
あなたは優秀な大学生活アシスタントAIです。
以下に、ユーザーのメールボックスから取得した複数のメールデータ（件名と本文）があります。

【タスク】
これらのメールを1つずつ読み、「就活」「広告」「Amazonなどの購入確認・発送通知」といった課題とは無関係なメールは【完全に無視】してください。
大学の「課題、宿題、レポート、定期試験、小テスト」に関する情報だけをすべて見つけ出し、指定のフォーマットで抽出してください。

【出力フォーマット】
必ず、以下のTypeScriptの型（Assignment型）の配列を内包するJSONオブジェクトのみを返してください。
マークダウンの \`\`\`json などの枠線や、挨拶、解説文は一切出力せず、純粋なJSON文字列のみを出力してください。

{
  "assignments": [
    {
      "id": "一意のランダムな文字列（例: ts-1, ts-2 など）",
      "title": "課題やテストの具体的な内容（例: 中間レポート（日本経済の現状分析））",
      "courseName": "講義名や授業名（例: 経済学101、不明な場合は「不明」）",
      "dueDate": "締め切り日時（可能な限り YYYY-MM-DD HH:mm 形式、分からなければメール内の表記通り）",
      "submitTo": "提出先プラットフォーム（例: Canvas, Google Classroom 等）",
      "source": "Gmail",
      "isMerged": false
    }
  ]
}

【入力メールデータ】
${rawEmails.map((email, index) => `
=== メール ${index + 1} ===
件名: ${email.subject}
本文: ${email.body}
------------------------
`).join('\n')}
`;

  try {
    // 2. OpenRouter API にリクエストを送信
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // 必須ではないがOpenRouterの推奨設定
        'X-Title': 'AI Assignment Assistant',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'user', content: prompt }
        ],
        // AIの出力を強制的にJSONにするモード
        response_format: { type: "json_object" },
        // ランダム性を低くし、安定してJSONを返させるための設定
        temperature: 0.1, 
      }),
    });

    if (!response.ok) {
      throw new Error(`APIリクエストが失敗しました。ステータス: ${response.status}`);
    }

    const data = await response.json();
    
    // AIの返答テキストを取得
    const rawJsonText = data.choices[0].message.content;
    
    // 文字列をJavaScriptのオブジェクトに変換
    const parsedData = JSON.parse(rawJsonText);
    
    // JSON内の assignments 配列を返す
    return parsedData.assignments as Assignment[];

  } catch (error) {
    console.error("OpenRouterによる課題抽出中にエラーが発生しました:", error);
    return [];
  }
}