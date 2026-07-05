export interface EmailMessage {
  id: string;
  date: string;
  subject: string;
  body: string;
}

export const DUMMY_EMAILS: EmailMessage[] = [
  {
    id: '1',
    date: '2026/07/05',
    subject: '【情報科学基礎】第5回レポート提出',
    body: 'Canvasから7月10日23:59までに提出してください。'
  },
  {
    id: '2',
    date: '2026/07/05',
    subject: 'Amazon ご注文ありがとうございます',
    body: '商品を発送しました。'
  },
  {
    id: '3',
    date: '2026/07/05',
    subject: '英語 小テストのお知らせ',
    body: '来週の授業で小テストを実施します。'
  }
];
