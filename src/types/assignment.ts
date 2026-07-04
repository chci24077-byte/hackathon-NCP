export interface Assignment {
	id: string;
	title: string;
	courseName: string;
	dueDate?: string;
	submitTo?: string;
	source?: string;
	isMerged?: boolean;
}

export type AssignmentsResponse = {
	assignments: Assignment[];
};

// テスト用の仮メールデータ（就活・広告・購入通知・大学の課題が混在）
export const mockRawEmailInbox: { subject: string; body: string }[] = [
	{
		subject: '【重要】第3回 レポート提出のお知らせ - 情報科学基礎',
		body: '情報科学基礎の第3回レポートを来週の水曜までにCanvasで提出してください。詳細は添付のPDFを確認。'
	},
	{
		subject: 'Amazon.co.jp ご注文の確認',
		body: 'ご注文いただきありがとうございます。発送は明日を予定しております。'
	},
	{
		subject: 'ゼミ：期末発表資料の提出',
		body: '期末プロジェクトの発表資料を7/10までにGoogle Classroomへ提出してください。チームごとに1ファイル。'
	},
	{
		subject: 'キャリアセンターからのご案内：就職イベント',
		body: '来月の就活イベント参加の案内です。エントリーはウェブからお願いします。'
	}
];
