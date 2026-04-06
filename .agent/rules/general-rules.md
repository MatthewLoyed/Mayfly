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

### 4. The "Platform Logic Parity" Rule
> **Context**: Building or modifying core services (Data, Auth, Logic).
- All core features and business logic MUST be implemented and functional for both Web and Native simultaneously.
- While the **UI/UX** can be optimized for the primary target (Mobile), the **underlying content and functionality** must never diverge.
- **Persistence**: Every data-storing action must persist on both Web (`localStorage`) and Native (`SQLite`).

### 5. Syntax & Safety Guardrails
- **Bracket Check**: Before finalizing any edit, perform a "bracket balance check" to ensure all `{` and JSX tags have matching closers.
- **Import Integrity**: Verify the export exists in the source file before writing an import statement.
- **Reanimated Safety**: Never read or write `.value` of a SharedValue directly in the body of a component during render. Use `useEffect` or `useAnimatedStyle`.

### 6. Precise Modal Keyboard Handling
> **Context**: Ensuring bottom-sheets and dialogs handle keyboard appearance without clipping or "double-pushing".
- **KeyboardAvoidingView Structure**:
    - `KeyboardAvoidingView` MUST be the direct parent of the sheet/card `Animated.View`.
    - Apply `style={{ flex: 1, justifyContent: 'flex-end' }}` (for bottom sheets) or `justifyContent: 'center'` (for dialogs) directly to the `KeyboardAvoidingView`.
    - Use `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`.
    - Avoid `keyboardVerticalOffset` in Modals unless a navigation header remains visible above the modal.
- **ScrollView Inside Sheet**:
    - Wrap modal content (excluding fixed header) in a `ScrollView`.
    - Always set `keyboardShouldPersistTaps="handled"`, `bounces={false}`, and `showsVerticalScrollIndicator={false}`.
- **Visual Integrity**:
    - Add `maxHeight: '85%'` to the sheet/card style to prevent overflowing on small devices.
    - Use absolute safe area insets (e.g., `useSafeAreaInsets`) or `Platform.OS` checks for consistent bottom padding.
- **Android Configuration**: Ensure `softwareKeyboardLayoutMode: resize` is set in `app.json` under the `android` key.
