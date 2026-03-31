/**
 * Free Trial (期間限定無料開放) 設定
 *
 * ここの日時を変えるだけでON/OFFできます。
 * - 期間外 → 通常の認証必須モード
 * - 期間内 → LINE友だち追加済みのゲストのみ利用可能
 *
 * 終了後はこのファイルを消すか、日付を過去にすれば自動OFF。
 */

/** 無料開放 開始日時 (JST) */
export const FREE_TRIAL_START = new Date('2026-03-27T00:00:00+09:00')

/** 無料開放 終了日時 (JST) — 日曜17:00 */
export const FREE_TRIAL_END = new Date('2026-03-29T17:00:00+09:00')

/**
 * 公式LINE 友だち追加URL
 * ※ 実際のURLに差し替えてください
 */
export const LINE_ADD_FRIEND_URL = 'https://lin.ee/s0dqTW3'

/** localStorage キー: LINE友だち追加済みフラグ */
export const LINE_ADDED_KEY = 'tornado_line_added'

/** 現在がフリートライアル期間内かどうか */
export function isFreeTrial(): boolean {
  const now = new Date()
  return now >= FREE_TRIAL_START && now <= FREE_TRIAL_END
}

/** フリートライアル終了までの残りミリ秒（0以下なら終了済み） */
export function freeTrialRemainingMs(): number {
  return FREE_TRIAL_END.getTime() - Date.now()
}

/** LINE友だち追加済みかどうか（localStorage） */
export function isLineAdded(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(LINE_ADDED_KEY) === 'true'
}

/** LINE友だち追加済みとしてマーク */
export function markLineAdded(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LINE_ADDED_KEY, 'true')
}

/** localStorage キー: LINE友だち追加ボタンを押したフラグ */
const LINE_OPENED_KEY = 'tornado_line_opened'

/** LINE友だち追加ボタンを押したかどうか（localStorage） */
export function isLineOpened(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(LINE_OPENED_KEY) === 'true'
}

/** LINE友だち追加ボタンを押したとしてマーク */
export function markLineOpened(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LINE_OPENED_KEY, 'true')
}
