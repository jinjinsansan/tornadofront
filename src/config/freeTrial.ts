/**
 * Free Trial (期間限定無料開放) 設定
 *
 * ここの日時を変えるだけでON/OFFできます。
 * - 期間外 → 通常の認証必須モード
 * - 期間内 → トークンなしでもゲストとして利用可能
 *
 * 終了後はこのファイルを消すか、日付を過去にすれば自動OFF。
 */

/** 無料開放 開始日時 (JST) */
export const FREE_TRIAL_START = new Date('2026-03-28T00:00:00+09:00')

/** 無料開放 終了日時 (JST) — 日曜17:00 */
export const FREE_TRIAL_END = new Date('2026-03-29T17:00:00+09:00')

/** 現在がフリートライアル期間内かどうか */
export function isFreeTrial(): boolean {
  const now = new Date()
  return now >= FREE_TRIAL_START && now <= FREE_TRIAL_END
}

/** フリートライアル終了までの残りミリ秒（0以下なら終了済み） */
export function freeTrialRemainingMs(): number {
  return FREE_TRIAL_END.getTime() - Date.now()
}
