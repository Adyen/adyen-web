# EMI Design Pattern

## Context and Problem Statement

EMI (Equated Monthly Installments) requires a composite component that orchestrates multiple payment methods (Card, UPI) within a single lifecycle. We need a pattern that handles switching between these methods while maintaining a shared submission flow.

## Decision Drivers

- **Code simplicity** — Minimize abstraction layers and cognitive overhead. Prioritize readable code over clever abstractions.
- **Bundle size** — Avoid shipping unused base class code
- **Debugging ease** — Clear, linear code paths for troubleshooting
- **Flexibility** — Ability to customize per funding source
- **Direct access** — Merchants can call funding source methods directly via getters

## Considered Options

- **Option 1:** Composition via Direct Extension 
- **Option 2:** Orchestration Framework abstracting funding source lifecycle


## Pros and Cons of the Options

### Option 1: Composition via direct UIElement Extension 

```
Class Hierarchy:

    ┌─────────────────┐
    │    UIElement    │
    │     (base)      │
    └────────┬────────┘
             │ extends
             ▼
    ┌─────────────────┐
    │       EMI       │
    │   (composite)   │
    └────────┬────────┘
             │ instantiates
             ▼
    ┌────────────────────────────┐
    │                            │
    ▼                            ▼
┌─────────────┐          ┌─────────────┐
│ CardElement │          │  UPIElement │
│  (UIElement)│          │  (UIElement)│
└─────────────┘          └─────────────┘


Component Structure:

┌─────────────────────────────────────────────┐
│                    EMI                       │
├─────────────────────────────────────────────┤
│  - fundingSourceUIElements: Record<...>      │
│  - activeFundingSource: EMIFundingSource     │
├─────────────────────────────────────────────┤
│  + get card(): CardElement                   │
│  + get upi(): UPIElement                     │
│  + get isValid(): boolean                    │
│  + formatData(): PaymentData                 │
│  + submit(): void                            │
└─────────────────────────────────────────────┘
             │ renders
             ▼
┌─────────────────────────────────────────────┐
│              EMIComponent                    │
├─────────────────────────────────────────────┤
│  - SegmentedControl (Card/UPI toggle)        │
│  - Active funding source .render()           │
│  - PayButton                                 │
└─────────────────────────────────────────────┘
```

**Pros:**
- Single inheritance level—EMI → UIElement
- Explicit element instantiation in constructor
- Direct property access via getters (`emi.card`, `emi.upi`)
- Full control over child element configuration
- No magic—what you see is what you get
- Smaller bundle footprint
- Merchants access methods directly: `emi.card.updateStyles()`, `emi.card.handleAction()`

**Cons:**
- Manual child lifecycle management
- Repeated boilerplate if pattern is used elsewhere

---

### Option 2: Orchestration Framework abstracting funding source lifecycle

```
Class Hierarchy:

    ┌─────────────────┐
    │    UIElement    │
    │     (base)      │
    └────────┬────────┘
             │ extends
             ▼
    ┌─────────────────┐
    │ HybridUIElement │
    │  (abstraction)  │
    └────────┬────────┘
             │ extends
             ▼
    ┌─────────────────┐
    │    EMIHybrid    │
    │   (composite)   │
    └────────┬────────┘
             │ registers
             ▼
    ┌────────────────────────────┐
    │                            │
    ▼                            ▼
┌─────────────┐          ┌─────────────┐
│ CardElement │          │  UPIElement │
│  (UIElement)│          │  (UIElement)│
└─────────────┘          └─────────────┘


Component Structure:

┌─────────────────────────────────────────────┐
│              HybridUIElement                 │
├─────────────────────────────────────────────┤
│  # fundingSources: Map<string, Registered>   │
│  # activeFundingSourceKey: string            │
├─────────────────────────────────────────────┤
│  # registerFundingSource()                   │
│  # getFundingSource()                        │
│  # setActiveFundingSource()                  │
│  # mountFundingSourceInSlot()                │
│  # getActiveFundingSourceData()              │
│  # isActiveFundingSourceValid()              │
└─────────────────────────────────────────────┘
             │ extends
             ▼
┌─────────────────────────────────────────────┐
│                EMIHybrid                     │
├─────────────────────────────────────────────┤
│  + activeFundingSource: EMIHybridFunding...  │
├─────────────────────────────────────────────┤
│  + get card(): CardElement                   │
│  + get upi(): UPIElement                     │
│  + formatData(): PaymentData                 │
│  + submit(): void                            │
└─────────────────────────────────────────────┘
             │ renders
             ▼
┌─────────────────────────────────────────────┐
│            EMIHybridComponent                │
├─────────────────────────────────────────────┤
│  - SegmentedControl (Card/UPI toggle)        │
│  - Card slot (ref-based mounting)            │
│  - UPI slot (ref-based mounting)             │
│  - PayButton                                 │
└─────────────────────────────────────────────┘
```

**Pros:**
- Structured lifecycle for funding sources
- Reusable base for future composite components
- Slot-based mounting for complex layouts

**Cons:**
- Extra inheritance layer increases complexity
- Hidden behavior in base class harder to debug
- Larger bundle size (~120 lines base class)
- Slot-based mounting adds indirection
- Steeper learning curve for new developers


---

## Comparison Summary

| Criteria                | Option 1            | Option 2              |
|-------------------------|---------------------|-----------------------|
| **Inheritance depth**   | 1 level             | 2 levels              |
| **Code transparency**   | High                | Medium                |
| **Debugging ease**      | Easy                | Moderate              |
| **Reusability**         | Copy pattern        | Extend base class     |
| **Direct method access**| Via getters         | Via getters           |
| **Learning curve**      | Low                 | Medium                |


## Decision Outcome

Chosen option: **"Option 1 - Direct UIElement extension"**

**Justification:** The EMI pattern provides simpler, more explicit code with fewer abstraction layers. Direct management of funding source elements is more transparent, easier to debug, and allows merchants to access funding source methods directly via getters (e.g., `emi.card.updateStyles()`).

### Positive Consequences

- Simpler mental model—one class, explicit child instantiation
- No hidden base class behavior to understand
- Smaller bundle size
- Direct access to funding source instances via getters
- Merchants can call any funding source method directly

### Negative Consequences

- Manual implementation of child lifecycle in each composite component
- Repeated patterns if more composite components are needed

## Recommendation

Use the **Composition via direct UIElement Extension  (Option 1)** for composite payment components. The simplicity and transparency outweigh the marginal reusability benefits of a base class abstraction.

