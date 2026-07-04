
import { mockRawEmailInbox } from '../types/assignment';

// Gmail からメールを取得して { subject, body } の配列を返す。
// 実運用では OAuth トークンを使用して Gmail REST API を呼び出します。
// 開発環境では環境変数 `VITE_GMAIL_OAUTH_TOKEN` にトークンを入れると実際に取得を試みます。
export async function getGmailMessages(): Promise<{ subject: string; body: string }[]> {
	console.log('Gmail取得開始');

	const token = (import.meta as any).env?.VITE_GMAIL_OAUTH_TOKEN;
	if (!token) {
		console.warn('VITE_GMAIL_OAUTH_TOKEN が設定されていません。モックデータを返します。');
		return mockRawEmailInbox;
	}

	const headers = {
		Authorization: `Bearer ${token}`,
		Accept: 'application/json',
	};

	const decodeBase64Url = (b64: string) => {
		try {
			const s = b64.replace(/-/g, '+').replace(/_/g, '/');
			const decoded = atob(s);
			try {
				// UTF-8 safe decode
				return decodeURIComponent(escape(decoded));
			} catch {
				return decoded;
			}
		} catch (e) {
			return '';
		}
	};

	const extractBodyFromPayload = (payload: any): string => {
		if (!payload) return '';
		if (payload.body && payload.body.data) {
			return decodeBase64Url(payload.body.data);
		}
		if (payload.parts && Array.isArray(payload.parts)) {
			// prefer text/plain
			for (const part of payload.parts) {
				if (part.mimeType === 'text/plain' && part.body && part.body.data) {
					return decodeBase64Url(part.body.data);
				}
			}
			// fallback to first part with data
			for (const part of payload.parts) {
				if (part.body && part.body.data) return decodeBase64Url(part.body.data);
			}
		}
		return '';
	};

	try {
		// 1) メッセージID一覧を取得
		const listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20', { headers });
		if (!listRes.ok) throw new Error(`messages list failed: ${listRes.status}`);
		const listJson = await listRes.json();
		const messages = listJson.messages || [];

		const results: { subject: string; body: string }[] = [];
		for (const m of messages) {
			try {
				const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`, { headers });
				if (!msgRes.ok) continue;
				const msgJson = await msgRes.json();
				const headersArr = msgJson.payload?.headers || [];
				const subject = headersArr.find((h: any) => h.name === 'Subject')?.value || '(件名なし)';
				const body = extractBodyFromPayload(msgJson.payload) || '';
				results.push({ subject, body });
			} catch (e) {
				// skip individual message errors
				console.warn('message fetch error', e);
				continue;
			}
		}

		// 取得できなかった場合はモックを返す
		if (results.length === 0) {
			return mockRawEmailInbox;
		}
		return results;
	} catch (error) {
		console.error('Gmail API 呼び出しに失敗しました:', error);
		return mockRawEmailInbox;
	}
}

