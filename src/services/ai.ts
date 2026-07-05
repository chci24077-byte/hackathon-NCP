export interface TaskInfo {
  isAssignment: boolean;
  courseName: string;
  assignmentName: string;
  deadline: string;
  submissionPlatform: string;
}

export async function analyzeEmail(subject: string, body: string): Promise<TaskInfo> {
  // 🔥 .env ファイルから安全にAPIキーを読み込みます（コード上からキーが隠れました！）
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("APIキーが設定されていません。.envファイルを確認してください。");
    return { isAssignment: false, courseName: "", assignmentName: "", deadline: "", submissionPlatform: "" };
  }

  const prompt = `
以下のメールを解析し、大学の「課題（宿題・レポート・小テスト）」に関するものか判定してください。
必ず指定のJSONフォーマットのみで返答してください。説明やマークダウンの枠（\`\`\`json など）は一切含めず、純粋なJSON文字列だけを返してください。

【件名】: ${subject}
【本文】: ${body}

JSONフォーマット:
{
  "isAssignment": trueまたはfalse,
  "courseName": "授業名",
  "assignmentName": "課題名",
  "deadline": "締切日時",
  "submissionPlatform": "提出先"
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google APIエラー: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponseText = data.candidates[0].content.parts[0].text;
    
    return JSON.parse(aiResponseText) as TaskInfo;
  } catch (error) {
    console.error("Gemini解析エラー詳細:", error);
    return {
      isAssignment: false,
      courseName: "",
      assignmentName: "",
      deadline: "",
      submissionPlatform: ""
    };
  }
}