---
trigger: always_on
---

# Mayfly Project Rules

## Core Principles
Mayfly is a premium, high-fidelity productivity app. Every interaction should feel tactile, fluid, and intentional.

### 1. The "Premium Default" Rule
> **Context**: Choosing libraries or implementation strategies.
- Always prioritize the option that delivers the highest quality user experience (60fps animations, native feel), even if it's harder to implement.
- **Example**: Use `react-native-reanimated` instead of `Animated` (legacy). Use `expo-blur` for frosted glass effects.

### 2. The "Tactile Interaction" Rule
> **Context**: Adding any interactive element (buttons, toggles, list items).
- Every interaction MUST have:
    1.  **Micro-animation**: Scale down on press (e.g., `0.98`), color shift, or spring-based feedback.
    2.  **Haptics**: Clear `expo-haptics` feedback:
        - `selectionAsync()` for light taps/selection changes.
        - `impactAsync(ImpactFeedbackStyle.Medium)` for toggles or completions.
        - `notificationAsync(NotificationFeedbackType.Success)` for major completion events.

### 3. The "Fluid Motion" Rule
> **Context**: Lists, conditional rendering, or Layout changes.
- Never allow items to "pop" into existence or snap instantly. 
- Use Reanimated Layout Animations (e.g., `LinearTransition`, `FadeIn`, `FadeOut`) for every list adjustment or layout shift.

### 4. Syntax & Safety Guardrails
- **Bracket Check**: Before finalizing any edit, perform a "bracket balance check" to ensure all `{` and JSX tags have matching closers.
- **Import Integrity**: Verify the export exists in the source file before writing an import statement.
- **Reanimated Safety**: Never read or write `.value` of a SharedValue directly in the body of a component during render. Use `useEffect` or `useAnimatedStyle`.
