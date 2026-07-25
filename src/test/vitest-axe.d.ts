/**
 * vitest-axe's built-in types augment the legacy `Vi` namespace, which Vitest 4
 * no longer uses. Augment expect matchers so `toHaveNoViolations` is typed.
 */
interface AxeMatchers {
  toHaveNoViolations(): void
}

declare module '@vitest/expect' {
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

export {}
