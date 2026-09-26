// Some sites answer an automated click with a security checkpoint instead of
// the next page: a CAPTCHA, an "unusual activity" interstitial, an identity
// check. Nothing scripted should try to solve that, so a node that lands on
// one throws this instead of returning a result, and the run task pauses for
// a person to clear it by hand in the Live View.
export class VerificationRequiredError extends Error {
  constructor(public readonly url: string) {
    super(`Manual verification required at ${url}`)
    this.name = "VerificationRequiredError"
  }
}

const URL_PATTERNS = [/\/checkpoint\//i, /\/uas\/verify/i, /captcha/i]

const MESSAGE_PATTERNS = [
  /captcha/i,
  /security check/i,
  /verify it.?s you/i,
  /confirm your identity/i,
  /unusual activity/i,
  /prove you.?re (a )?human/i,
  /are you a robot/i,
]

export function looksLikeVerification(url: string, message?: string) {
  return (
    URL_PATTERNS.some((pattern) => pattern.test(url)) ||
    (message ? MESSAGE_PATTERNS.some((pattern) => pattern.test(message)) : false)
  )
}
