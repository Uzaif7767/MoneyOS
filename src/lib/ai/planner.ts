import 'server-only';
import { getAIProvider, AIError } from './index';

export interface PlannerItemSummary {
  name: string;
  amount: number;
}

export interface SanitizedPlannerContext {
  planningMonth: string;
  plannedMonthlyIncome: number;
  currentBalance?: number;
  expectedIncomeDate?: string;
  fixedExpensesTotal: number;
  fixedExpensesItems?: PlannerItemSummary[];
  plannedBillsTotal: number;
  plannedBillsItems?: PlannerItemSummary[];
  subscriptionsTotal: number;
  subscriptionsItems?: PlannerItemSummary[];
  everydayLivingTotal: number;
  foodAndDailyLivingTotal?: number;
  transportTotal?: number;
  housingTotal?: number;
  familyPersonalTotal: number;
  debtEmiTotal: number;
  debtEmiItems?: PlannerItemSummary[];
  lifestyleDiscretionaryTotal: number;
  oneTimeExpensesTotal: number;
  oneTimeExpensesItems?: PlannerItemSummary[];
  totalPlannedSpending: number;
  savingsGoalAmount: number;
  recommendedSavingsBenchmark?: number;
  safetyBuffer: number;
  remainingMoney: number;
  isAffordable: boolean;
}

export interface PlannerAIInsights {
  summary: string;
  observations: string[];
  suggestions: string[];
}

export interface PlannerAIResult {
  success: boolean;
  insights?: PlannerAIInsights;
  error?: string;
}

const PLANNER_SYSTEM_PROMPT = `You are the MoneyOS AI Planning Assistant.
Your task is to analyze the user's monthly budget planner summary and generate practical, neutral, high-level financial insights.

CRITICAL CONSTRAINTS:
1. Deterministic MoneyOS calculations are authoritative. Do not recalculate or replace them.
2. Interpret the supplied planner context to identify obvious planning trade-offs and highlight areas that may need attention.
3. Provide practical, neutral suggestions based strictly on the provided summary numbers.
4. Avoid unsupported assumptions or inventing missing information (such as fake transactions, fake income sources, fake bills, or unmentioned goals).
5. Avoid claiming certainty about future finances and do NOT present yourself as a certified financial advisor.
6. Do NOT suggest or attempt to modify any financial records.
7. Output MUST strictly be valid JSON matching the requested schema.`;

const SCHEMA_DESCRIPTION = `{
  "summary": "Short neutral explanation of the monthly plan status and cash flow balance.",
  "observations": [
    "Observation 1 (e.g. key budget allocations or potential trade-offs)",
    "Observation 2"
  ],
  "suggestions": [
    "Practical neutral suggestion 1",
    "Practical neutral suggestion 2"
  ]
}`;

function validatePlannerAIInsights(data: unknown): PlannerAIInsights | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    return null;
  }

  if (!Array.isArray(obj.observations)) {
    return null;
  }

  const observations = obj.observations
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());

  if (observations.length === 0) {
    return null;
  }

  if (!Array.isArray(obj.suggestions)) {
    return null;
  }

  const suggestions = obj.suggestions
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());

  if (suggestions.length === 0) {
    return null;
  }

  return {
    summary: obj.summary.trim(),
    observations,
    suggestions,
  };
}

/**
 * Server-only service function that calls the existing Groq AI provider
 * with sanitized planner context and returns strongly validated structured AI insights.
 */
export async function generatePlannerAIInsights(
  context: SanitizedPlannerContext
): Promise<PlannerAIResult> {
  try {
    const provider = getAIProvider();

    const promptText = `Monthly Financial Planning Context:
- Planning Month: ${context.planningMonth}
- Planned Monthly Income: ₹${context.plannedMonthlyIncome}
- Fixed Expenses Total: ₹${context.fixedExpensesTotal}
- Planned Bills Total: ₹${context.plannedBillsTotal}
- Subscriptions Total: ₹${context.subscriptionsTotal}
- Everyday Living Total: ₹${context.everydayLivingTotal}
- Family & Personal Total: ₹${context.familyPersonalTotal}
- Debt & EMI Total: ₹${context.debtEmiTotal}
- Lifestyle & Discretionary Total: ₹${context.lifestyleDiscretionaryTotal}
- One-Time Expenses Total: ₹${context.oneTimeExpensesTotal}
- Total Planned Spending: ₹${context.totalPlannedSpending}
- Savings Goal Target: ₹${context.savingsGoalAmount}
- Safety Buffer: ₹${context.safetyBuffer}
- Deterministic Remaining Money: ₹${context.remainingMoney}
- Cash Flow Status: ${context.isAffordable ? 'Surplus (Affordable)' : 'Deficit (Shortfall)'}`;

    const response = await provider.generateStructured<PlannerAIInsights>({
      prompt: promptText,
      systemPrompt: PLANNER_SYSTEM_PROMPT,
      schemaDescription: SCHEMA_DESCRIPTION,
      temperature: 0.2,
      maxTokens: 1000,
    });

    const validated = validatePlannerAIInsights(response.data);
    if (!validated) {
      console.error('Planner AI response schema validation failed:', response.rawText);
      return {
        success: false,
        error: 'AI planning insights are temporarily unavailable.',
      };
    }

    return {
      success: true,
      insights: validated,
    };
  } catch (error) {
    console.error('Error calling Groq AI provider for planner insights:', error);
    if (error instanceof AIError) {
      return {
        success: false,
        error: 'AI planning insights are temporarily unavailable.',
      };
    }
    return {
      success: false,
      error: 'AI planning insights are temporarily unavailable.',
    };
  }
}

/* ========================================================================== */
/* Phase 2.6: Complete Life-Budget Breakdown Types & AI Service Implementation*/
/* ========================================================================== */

export type CategoryId =
  | 'home_living'
  | 'food_daily_living'
  | 'transport'
  | 'work_job'
  | 'personal'
  | 'subscriptions'
  | 'family_responsibilities'
  | 'debt_obligations'
  | 'lifestyle_entertainment'
  | 'health'
  | 'one_time_expenses'
  | 'savings_future';

export interface AICategorySubItem {
  name: string;
  amount: number;
  reason?: string;
  isUserItem?: boolean;
}

export interface AIDetailedCategory {
  id: CategoryId;
  title: string;
  currentAmount: number;
  suggestedTotal: number;
  items: AICategorySubItem[];
}

export interface AIProposedAllocations {
  fixedExpenses: number;
  plannedBills: number;
  subscriptions: number;
  foodAndDailyLiving: number;
  transport: number;
  housing: number;
  familyPersonal: number;
  debtEmi: number;
  lifestyleDiscretionary: number;
  oneTimeExpenses: number;
  savings: number;
  safetyBuffer: number;
}

export interface AIProposedPlan {
  summary: string;
  strategy: string;
  categories: AIDetailedCategory[];
  allocations: AIProposedAllocations;
  suggestedRemainingMoney: number;
  tradeoffs: string[];
  priorityActions: string[];
}

export interface RecalculatedProposedSummary {
  totalProposedSpending: number;
  totalProposedSavings: number;
  totalProposedSafetyBuffer: number;
  totalProposedAllocations: number;
  recalculatedRemainingMoney: number;
  plannedMonthlyIncome: number;
  isAffordable: boolean;
}

export interface AIProposedPlanResult {
  success: boolean;
  proposal?: AIProposedPlan;
  recalculatedSummary?: RecalculatedProposedSummary;
  error?: string;
}

const CATEGORY_CANONICAL_MAP: Record<string, { id: CategoryId; title: string }> = {
  home_living: { id: 'home_living', title: 'Home & Living' },
  homeliving: { id: 'home_living', title: 'Home & Living' },
  home: { id: 'home_living', title: 'Home & Living' },

  food_daily_living: { id: 'food_daily_living', title: 'Food & Daily Living' },
  fooddailyliving: { id: 'food_daily_living', title: 'Food & Daily Living' },
  food: { id: 'food_daily_living', title: 'Food & Daily Living' },
  everyday_living: { id: 'food_daily_living', title: 'Food & Daily Living' },

  transport: { id: 'transport', title: 'Transport' },
  travel: { id: 'transport', title: 'Transport' },

  work_job: { id: 'work_job', title: 'Work / Job' },
  workjob: { id: 'work_job', title: 'Work / Job' },
  work: { id: 'work_job', title: 'Work / Job' },
  job: { id: 'work_job', title: 'Work / Job' },

  personal: { id: 'personal', title: 'Personal' },

  subscriptions: { id: 'subscriptions', title: 'Subscriptions & Memberships' },
  subscriptions_memberships: { id: 'subscriptions', title: 'Subscriptions & Memberships' },

  family_responsibilities: { id: 'family_responsibilities', title: 'Family & Responsibilities' },
  familyresponsibilities: { id: 'family_responsibilities', title: 'Family & Responsibilities' },
  family: { id: 'family_responsibilities', title: 'Family & Responsibilities' },

  debt_obligations: { id: 'debt_obligations', title: 'Debt & Financial Obligations' },
  debtobligations: { id: 'debt_obligations', title: 'Debt & Financial Obligations' },
  debt: { id: 'debt_obligations', title: 'Debt & Financial Obligations' },
  debtemi: { id: 'debt_obligations', title: 'Debt & Financial Obligations' },

  lifestyle_entertainment: { id: 'lifestyle_entertainment', title: 'Lifestyle & Entertainment' },
  lifestyleentertainment: { id: 'lifestyle_entertainment', title: 'Lifestyle & Entertainment' },
  lifestyle: { id: 'lifestyle_entertainment', title: 'Lifestyle & Entertainment' },

  health: { id: 'health', title: 'Health' },
  medical: { id: 'health', title: 'Health' },

  one_time_expenses: { id: 'one_time_expenses', title: 'One-Time / Irregular Expenses' },
  onetimeexpenses: { id: 'one_time_expenses', title: 'One-Time / Irregular Expenses' },

  savings_future: { id: 'savings_future', title: 'Savings & Future Money' },
  savingsfuture: { id: 'savings_future', title: 'Savings & Future Money' },
  savings: { id: 'savings_future', title: 'Savings & Future Money' },
};

const PROPOSE_PLAN_SYSTEM_PROMPT = `You are the MoneyOS AI Financial Planner.
Your task is to break down the user's monthly budget planner categories into practical, realistic personal budget sub-factors for a working person.

CRITICAL CONSTRAINTS & INSTRUCTIONS:
1. User-entered explicit items (e.g. Rent ₹20,000, WiFi ₹1,000, Car EMI ₹8,000) MUST be preserved in the output items with their exact names and amounts.
2. For broad category amounts (e.g. Food ₹10,000, Transport ₹3,000), break them down into 3-6 realistic sub-factors (e.g. Groceries, Office Meals, Breakfast, Fuel, Metro, etc.).
3. DO NOT dump all possible sub-factors. Include ONLY relevant sub-factors with positive amounts > 0 based on available context.
4. DO NOT invent fake debts, children, remittances, medical conditions, or family support unless supported by context.
5. If a category has ₹0 allocation in planner context and no user items, do NOT generate fake zero-amount items (omit or leave empty).
6. MoneyOS engine will deterministically sum item amounts for category totals and overall remaining money.
7. Provide 3-5 concise, highly specific priority actions ("What I'd Change") tailored to the user's actual financial shortfall/surplus.
8. Output MUST strictly be valid JSON matching the requested schema.`;

const PROPOSE_PLAN_SCHEMA_DESCRIPTION = `{
  "summary": "Practical overview of the proposed monthly allocation strategy.",
  "strategy": "Concise explanation of how the plan balances essential expenses, savings goals, and safety buffers.",
  "categories": [
    {
      "id": "home_living",
      "title": "Home & Living",
      "items": [
        {
          "name": "Rent / PG",
          "amount": 20000,
          "reason": "Fixed monthly commitment"
        },
        {
          "name": "Electricity",
          "amount": 2000,
          "reason": "Estimated utility bill"
        }
      ]
    },
    {
      "id": "food_daily_living",
      "title": "Food & Daily Living",
      "items": [
        {
          "name": "Groceries",
          "amount": 4000,
          "reason": "Pantry & staples"
        },
        {
          "name": "Office Lunch",
          "amount": 2000,
          "reason": "Workday meals"
        }
      ]
    }
  ],
  "priorityActions": [
    "Reduce Food & Daily Living by ₹15,000 to resolve cash flow deficit.",
    "Keep fixed commitments fully funded.",
    "Protect the ₹15,000 savings target."
  ],
  "tradeoffs": [
    "Tradeoff note 1",
    "Tradeoff note 2"
  ]
}`;

function deriveCurrentCategoryAmount(catId: CategoryId, context: SanitizedPlannerContext): number {
  switch (catId) {
    case 'home_living':
      const housing = context.housingTotal ?? 0;
      const homeFixed = (context.fixedExpensesItems || [])
        .filter((item) => /rent|pg|home|maintenance|maid|flat|house/i.test(item.name))
        .reduce((sum, item) => sum + item.amount, 0);
      return Math.max(housing, homeFixed);

    case 'food_daily_living':
      return context.foodAndDailyLivingTotal ?? context.everydayLivingTotal;

    case 'transport':
      return context.transportTotal ?? 0;

    case 'work_job':
      return 0;

    case 'personal':
      return 0;

    case 'subscriptions':
      return context.subscriptionsTotal;

    case 'family_responsibilities':
      return context.familyPersonalTotal;

    case 'debt_obligations':
      return context.debtEmiTotal;

    case 'lifestyle_entertainment':
      return context.lifestyleDiscretionaryTotal;

    case 'health':
      return 0;

    case 'one_time_expenses':
      return context.oneTimeExpensesTotal;

    case 'savings_future':
      return context.savingsGoalAmount + context.safetyBuffer;

    default:
      return 0;
  }
}

function validateAIProposedPlan(
  data: unknown,
  context: SanitizedPlannerContext
): AIProposedPlan | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    return null;
  }

  const strategyText =
    typeof obj.strategy === 'string' && obj.strategy.trim()
      ? obj.strategy.trim()
      : obj.summary.trim();

  const tradeoffs = Array.isArray(obj.tradeoffs)
    ? obj.tradeoffs
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim())
    : [
        'Prioritizes essential housing, fixed commitments, and debt obligations first.',
        'Reallocates variable discretionary spending to protect your safety buffer.',
      ];

  const priorityActions = Array.isArray(obj.priorityActions)
    ? obj.priorityActions
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim())
    : [
        'Protect your planned savings target and safety buffer first.',
        'Keep essential commitments fully funded.',
        'Review variable spending allowances weekly.',
      ];

  const rawCategories = Array.isArray(obj.categories) ? obj.categories : [];
  const processedCategories: AIDetailedCategory[] = [];
  const processedCategoryIds = new Set<CategoryId>();

  for (const rawCat of rawCategories) {
    if (!rawCat || typeof rawCat !== 'object') continue;
    const catObj = rawCat as Record<string, unknown>;
    const rawId = String(catObj.id || catObj.title || '')
      .toLowerCase()
      .trim();

    const matched = CATEGORY_CANONICAL_MAP[rawId] || CATEGORY_CANONICAL_MAP[rawId.replace(/[^a-z0-9]/g, '')];
    if (!matched) continue;

    if (processedCategoryIds.has(matched.id)) continue;

    const rawItems = Array.isArray(catObj.items) ? catObj.items : [];
    const validItems: AICategorySubItem[] = [];

    for (const rawItem of rawItems) {
      if (!rawItem || typeof rawItem !== 'object') continue;
      const itemObj = rawItem as Record<string, unknown>;
      const name = typeof itemObj.name === 'string' ? itemObj.name.trim() : '';
      const amount = typeof itemObj.amount === 'number' && Number.isFinite(itemObj.amount) ? itemObj.amount : 0;
      const reason = typeof itemObj.reason === 'string' ? itemObj.reason.trim() : undefined;

      if (name.length > 0 && amount > 0) {
        validItems.push({
          name,
          amount: Math.round(amount * 100) / 100,
          reason,
        });
      }
    }

    // MoneyOS Category Total Validation: Deterministically sum sub-factors
    const calculatedTotal = validItems.reduce((sum, i) => sum + i.amount, 0);
    const roundedTotal = Math.round(calculatedTotal * 100) / 100;
    const currentAmount = deriveCurrentCategoryAmount(matched.id, context);

    // Keep category if it has positive suggested items or user input amount
    if (validItems.length > 0 || currentAmount > 0) {
      processedCategories.push({
        id: matched.id,
        title: matched.title,
        currentAmount: Math.round(currentAmount * 100) / 100,
        suggestedTotal: roundedTotal,
        items: validItems,
      });
      processedCategoryIds.add(matched.id);
    }
  }

  // Ensure essential planner categories exist if user entered data for them
  const fallbackCategoryChecks: { id: CategoryId; title: string; currentVal: number; itemsFallback: AICategorySubItem[] }[] = [
    {
      id: 'home_living',
      title: 'Home & Living',
      currentVal: deriveCurrentCategoryAmount('home_living', context),
      itemsFallback: (context.fixedExpensesItems || [])
        .filter((item) => /rent|pg|home|maintenance|maid|flat|house/i.test(item.name))
        .map((i) => ({ name: i.name, amount: i.amount, isUserItem: true })),
    },
    {
      id: 'food_daily_living',
      title: 'Food & Daily Living',
      currentVal: context.foodAndDailyLivingTotal ?? context.everydayLivingTotal,
      itemsFallback: [],
    },
    {
      id: 'transport',
      title: 'Transport',
      currentVal: context.transportTotal ?? 0,
      itemsFallback: [],
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions & Memberships',
      currentVal: context.subscriptionsTotal,
      itemsFallback: (context.subscriptionsItems || []).map((i) => ({ name: i.name, amount: i.amount, isUserItem: true })),
    },
    {
      id: 'debt_obligations',
      title: 'Debt & Financial Obligations',
      currentVal: context.debtEmiTotal,
      itemsFallback: (context.debtEmiItems || []).map((i) => ({ name: i.name, amount: i.amount, isUserItem: true })),
    },
    {
      id: 'one_time_expenses',
      title: 'One-Time / Irregular Expenses',
      currentVal: context.oneTimeExpensesTotal,
      itemsFallback: (context.oneTimeExpensesItems || []).map((i) => ({ name: i.name, amount: i.amount, isUserItem: true })),
    },
    {
      id: 'savings_future',
      title: 'Savings & Future Money',
      currentVal: context.savingsGoalAmount + context.safetyBuffer,
      itemsFallback: [
        ...(context.savingsGoalAmount > 0 ? [{ name: 'Monthly Savings Target', amount: context.savingsGoalAmount, isUserItem: true }] : []),
        ...(context.safetyBuffer > 0 ? [{ name: 'Safety Buffer Reserve', amount: context.safetyBuffer, isUserItem: true }] : []),
      ],
    },
  ];

  for (const fallback of fallbackCategoryChecks) {
    if (!processedCategoryIds.has(fallback.id) && (fallback.currentVal > 0 || fallback.itemsFallback.length > 0)) {
      const items = fallback.itemsFallback.length > 0
        ? fallback.itemsFallback
        : [{ name: `${fallback.title} Allocation`, amount: fallback.currentVal }];
      const total = items.reduce((sum, i) => sum + i.amount, 0);

      processedCategories.push({
        id: fallback.id,
        title: fallback.title,
        currentAmount: Math.round(fallback.currentVal * 100) / 100,
        suggestedTotal: Math.round(total * 100) / 100,
        items,
      });
      processedCategoryIds.add(fallback.id);
    }
  }

  // Derive top-level allocations object for backward compatibility
  const allocations: AIProposedAllocations = {
    fixedExpenses: context.fixedExpensesTotal,
    plannedBills: context.plannedBillsTotal,
    subscriptions: context.subscriptionsTotal,
    foodAndDailyLiving: 0,
    transport: 0,
    housing: context.housingTotal ?? 0,
    familyPersonal: context.familyPersonalTotal,
    debtEmi: context.debtEmiTotal,
    lifestyleDiscretionary: context.lifestyleDiscretionaryTotal,
    oneTimeExpenses: context.oneTimeExpensesTotal,
    savings: context.savingsGoalAmount,
    safetyBuffer: context.safetyBuffer,
  };

  for (const cat of processedCategories) {
    if (cat.id === 'food_daily_living') allocations.foodAndDailyLiving = cat.suggestedTotal;
    if (cat.id === 'transport') allocations.transport = cat.suggestedTotal;
    if (cat.id === 'home_living') allocations.housing = cat.suggestedTotal;
    if (cat.id === 'lifestyle_entertainment') allocations.lifestyleDiscretionary = cat.suggestedTotal;
    if (cat.id === 'family_responsibilities') allocations.familyPersonal = cat.suggestedTotal;
    if (cat.id === 'debt_obligations') allocations.debtEmi = cat.suggestedTotal;
    if (cat.id === 'subscriptions') allocations.subscriptions = cat.suggestedTotal;
    if (cat.id === 'one_time_expenses') allocations.oneTimeExpenses = cat.suggestedTotal;
    if (cat.id === 'savings_future') {
      const savingsItem = cat.items.find((i) => /savings|goal/i.test(i.name));
      const bufferItem = cat.items.find((i) => /buffer|emergency/i.test(i.name));
      if (savingsItem) allocations.savings = savingsItem.amount;
      if (bufferItem) allocations.safetyBuffer = bufferItem.amount;
    }
  }

  const totalAllItems = processedCategories.reduce((sum, cat) => sum + cat.suggestedTotal, 0);
  const suggestedRemaining = Math.round((context.plannedMonthlyIncome - totalAllItems) * 100) / 100;

  return {
    summary: obj.summary.trim(),
    strategy: strategyText,
    categories: processedCategories,
    allocations,
    suggestedRemainingMoney: suggestedRemaining,
    tradeoffs: tradeoffs.length > 0 ? tradeoffs : [
      'Prioritizes essential commitments and debt obligations first.',
      'Protects your savings target and safety buffer.',
    ],
    priorityActions: priorityActions.length > 0 ? priorityActions : [
      'Protect your planned savings target and safety buffer first.',
      'Keep essential commitments fully funded.',
      'Maintain the safety buffer for unexpected expenses.',
    ],
  };
}

/**
 * Server-only service function that calls the existing Groq AI provider
 * with sanitized planner context to generate a complete life-budget breakdown.
 */
export async function generateProposedAIPlan(
  context: SanitizedPlannerContext
): Promise<AIProposedPlanResult> {
  try {
    const provider = getAIProvider();

    // Format user repeatable items for context prompt
    const formatItems = (items?: PlannerItemSummary[]) =>
      items && items.length > 0
        ? items.map((i) => `${i.name}: ₹${i.amount}`).join(', ')
        : 'None specified';

    const promptText = `Monthly Financial Planning Context:
- Planning Month: ${context.planningMonth}
- Planned Monthly Income: ₹${context.plannedMonthlyIncome}
- Current Balance: ₹${context.currentBalance ?? 0}
- Expected Income Date: ${context.expectedIncomeDate || 'Not specified'}
- Fixed Expenses Total: ₹${context.fixedExpensesTotal} (Items: ${formatItems(context.fixedExpensesItems)})
- Planned Bills Total: ₹${context.plannedBillsTotal} (Items: ${formatItems(context.plannedBillsItems)})
- Subscriptions Total: ₹${context.subscriptionsTotal} (Items: ${formatItems(context.subscriptionsItems)})
- Food & Daily Living Total: ₹${context.foodAndDailyLivingTotal ?? context.everydayLivingTotal}
- Transport Total: ₹${context.transportTotal ?? 0}
- Housing Total: ₹${context.housingTotal ?? 0}
- Family & Personal Total: ₹${context.familyPersonalTotal}
- Debt & EMI Total: ₹${context.debtEmiTotal} (Items: ${formatItems(context.debtEmiItems)})
- Lifestyle & Discretionary Total: ₹${context.lifestyleDiscretionaryTotal}
- One-Time Expenses Total: ₹${context.oneTimeExpensesTotal} (Items: ${formatItems(context.oneTimeExpensesItems)})
- Savings Goal Target: ₹${context.savingsGoalAmount}
- Recommended Savings Benchmark (25%): ₹${context.recommendedSavingsBenchmark ?? 0}
- Safety Buffer Reserve: ₹${context.safetyBuffer}
- Deterministic Total Planned Spending: ₹${context.totalPlannedSpending}
- Deterministic Remaining Money: ₹${context.remainingMoney}
- Cash Flow Status: ${context.isAffordable ? 'Surplus (Affordable)' : 'Deficit (Shortfall)'}

Please break down these categories into practical, realistic personal budget sub-factors suitable for a working person. Preserve any explicitly listed user items. Return strictly valid JSON matching the schema.`;

    const response = await provider.generateStructured<AIProposedPlan>({
      prompt: promptText,
      systemPrompt: PROPOSE_PLAN_SYSTEM_PROMPT,
      schemaDescription: PROPOSE_PLAN_SCHEMA_DESCRIPTION,
      temperature: 0.2,
      maxTokens: 1800,
    });

    const validated = validateAIProposedPlan(response.data, context);
    if (!validated) {
      console.error('AI Proposed Plan response validation failed:', response.rawText);
      return {
        success: false,
        error: 'AI plan could not be generated right now. Your saved planner data is safe.',
      };
    }

    // MoneyOS Deterministic Arithmetic Engine Recalculation
    // 1. Separate spending categories vs savings/buffer categories
    let totalProposedSpending = 0;
    let totalProposedSavings = 0;
    let totalProposedSafetyBuffer = 0;

    for (const cat of validated.categories) {
      if (cat.id === 'savings_future') {
        for (const item of cat.items) {
          if (/buffer|emergency/i.test(item.name)) {
            totalProposedSafetyBuffer += item.amount;
          } else {
            totalProposedSavings += item.amount;
          }
        }
      } else {
        totalProposedSpending += cat.suggestedTotal;
      }
    }

    // Fallbacks if savings/buffer weren't explicit in categories array
    if (totalProposedSavings === 0 && context.savingsGoalAmount > 0) {
      totalProposedSavings = context.savingsGoalAmount;
    }
    if (totalProposedSafetyBuffer === 0 && context.safetyBuffer > 0) {
      totalProposedSafetyBuffer = context.safetyBuffer;
    }

    const totalProposedAllocations = totalProposedSpending + totalProposedSavings + totalProposedSafetyBuffer;
    const recalculatedRemainingMoney = context.plannedMonthlyIncome - totalProposedAllocations;

    return {
      success: true,
      proposal: validated,
      recalculatedSummary: {
        totalProposedSpending: Math.round(totalProposedSpending * 100) / 100,
        totalProposedSavings: Math.round(totalProposedSavings * 100) / 100,
        totalProposedSafetyBuffer: Math.round(totalProposedSafetyBuffer * 100) / 100,
        totalProposedAllocations: Math.round(totalProposedAllocations * 100) / 100,
        recalculatedRemainingMoney: Math.round(recalculatedRemainingMoney * 100) / 100,
        plannedMonthlyIncome: context.plannedMonthlyIncome,
        isAffordable: recalculatedRemainingMoney >= 0,
      },
    };
  } catch (error) {
    console.error('Error calling Groq AI provider for proposed plan:', error);
    return {
      success: false,
      error: 'AI plan could not be generated right now. Your saved planner data is safe.',
    };
  }
}

/* ========================================================================== */
/* Phase 2.7: AI Budget Optimization & Rebalancing                           */
/* ========================================================================== */

export type OptimizationProblemType =
  | 'shortfall'
  | 'low_savings'
  | 'excessive_category'
  | 'balanced'
  | 'surplus';

export type OptimizationMode =
  | 'auto'
  | 'fix_shortfall'
  | 'increase_savings'
  | 'protect_safety_buffer'
  | 'reduce_discretionary';

export interface AIOptimizationChange {
  categoryId: CategoryId;
  categoryTitle: string;
  itemName: string;
  currentAmount: number;
  suggestedAmount: number;
  difference: number; // Deterministically calculated by MoneyOS (suggestedAmount - currentAmount)
  reason: string;
}

export interface AIOptimizationProblem {
  type: OptimizationProblemType;
  amount: number;
  description: string;
}

export interface AIOptimizationResultData {
  summary: string;
  problem: AIOptimizationProblem;
  changes: AIOptimizationChange[];
  expectedOutcome: string;
  priorityActions: string[];
}

export interface OptimizationBeforeAfterSummary {
  planningMonth: string;
  plannedMonthlyIncome: number;
  before: {
    totalSpending: number;
    totalSavings: number;
    safetyBuffer: number;
    remainingMoney: number;
    isAffordable: boolean;
  };
  proposed: {
    totalSpending: number;
    totalSavings: number;
    safetyBuffer: number;
    remainingMoney: number;
    isAffordable: boolean;
  };
  improvement: {
    spendingDifference: number;
    savingsDifference: number;
    safetyBufferDifference: number;
    remainingMoneyDifference: number;
    isShortfallResolved: boolean;
  };
  updatedCategories: AIDetailedCategory[];
}

export interface AIOptimizationResult {
  success: boolean;
  optimization?: AIOptimizationResultData;
  recalculated?: OptimizationBeforeAfterSummary;
  error?: string;
}

const OPTIMIZE_PLAN_SYSTEM_PROMPT = `You are the MoneyOS AI Financial Optimization Engine.
Your task is to analyze the user's current monthly budget plan and detailed category breakdown, identify budget pressure points, and propose intelligent, realistic rebalancing changes.

CORE REBALANCING PRINCIPLES:
1. Protect essential commitments in this priority order:
   - Fixed obligations (Rent/Housing, Utilities, Debt/EMI, Bills) -> Preserve exact amounts unless context specifies changes.
   - Essential living & Family responsibilities -> Protect basic living needs.
   - Safety buffer reserve -> Protect emergency buffer.
   - Savings target -> Maintain or boost savings goals.
   - Lifestyle & Discretionary spending (Food delivery, eating out, entertainment, hobbies, non-essential sub-factors) -> Primary area to rebalance or reduce when eliminating a shortfall.
2. DO NOT blindly cut fixed obligations (Rent, EMI, Bills).
3. DO NOT invent fake debts, children, medical emergencies, or investments.
4. If a plan has a SHORTFALL (remaining money < 0), propose specific, realistic sub-factor reductions in variable categories to eliminate or minimize the deficit.
5. If a plan has a SURPLUS (remaining money > 0), propose rebalancing surplus into savings or safety buffer while retaining reasonable discretionary allowances.
6. Provide specific context-aware reasons for every change.
7. Output MUST strictly be valid JSON matching the requested schema.`;

const OPTIMIZE_PLAN_SCHEMA_DESCRIPTION = `{
  "summary": "Executive explanation of the optimization strategy and cash flow improvements.",
  "problem": {
    "type": "shortfall | low_savings | excessive_category | balanced | surplus",
    "amount": 25000,
    "description": "Description of the identified issue (e.g. Shortfall of ₹25,000 in monthly cash flow)."
  },
  "changes": [
    {
      "categoryId": "food_daily_living",
      "itemName": "Food Delivery / Eating Out",
      "currentAmount": 6000,
      "suggestedAmount": 3000,
      "reason": "Reduce food delivery frequency to once weekly to lower discretionary spending."
    }
  ],
  "expectedOutcome": "Shortfall eliminated, resulting in a balanced monthly cash flow while keeping savings intact.",
  "priorityActions": [
    "Limit dining out and delivery to once per week.",
    "Maintain rent and debt EMI payments on time.",
    "Keep safety buffer reserve untouched."
  ]
}`;

function validateAIOptimizationResultData(
  data: unknown
): AIOptimizationResultData | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;

  if (typeof obj.summary !== "string" || !obj.summary.trim()) {
    return null;
  }

  // Validate problem object
  if (!obj.problem || typeof obj.problem !== "object") return null;
  const probObj = obj.problem as Record<string, unknown>;
  const validProblemTypes: OptimizationProblemType[] = [
    "shortfall",
    "low_savings",
    "excessive_category",
    "balanced",
    "surplus",
  ];
  const problemType = String(probObj.type || "").toLowerCase().trim() as OptimizationProblemType;
  if (!validProblemTypes.includes(problemType)) return null;

  const problemAmount =
    typeof probObj.amount === "number" && Number.isFinite(probObj.amount) && probObj.amount >= 0
      ? probObj.amount
      : 0;
  const problemDesc =
    typeof probObj.description === "string" && probObj.description.trim()
      ? probObj.description.trim()
      : `Identified ${problemType} of ₹${problemAmount.toLocaleString("en-IN")}.`;

  // Validate changes array
  if (!Array.isArray(obj.changes)) return null;

  const validChanges: AIOptimizationChange[] = [];

  for (const rawChange of obj.changes) {
    if (!rawChange || typeof rawChange !== "object") continue;
    const changeObj = rawChange as Record<string, unknown>;

    const rawCatId = String(changeObj.categoryId || "").toLowerCase().trim();
    const matchedCat =
      CATEGORY_CANONICAL_MAP[rawCatId] ||
      CATEGORY_CANONICAL_MAP[rawCatId.replace(/[^a-z0-9]/g, "")];

    if (!matchedCat) continue;

    const itemName = typeof changeObj.itemName === "string" ? changeObj.itemName.trim() : "";
    if (!itemName) continue;

    const currentAmount =
      typeof changeObj.currentAmount === "number" &&
      Number.isFinite(changeObj.currentAmount) &&
      changeObj.currentAmount >= 0
        ? Math.round(changeObj.currentAmount * 100) / 100
        : 0;

    const suggestedAmount =
      typeof changeObj.suggestedAmount === "number" &&
      Number.isFinite(changeObj.suggestedAmount) &&
      changeObj.suggestedAmount >= 0
        ? Math.round(changeObj.suggestedAmount * 100) / 100
        : 0;

    const reason =
      typeof changeObj.reason === "string" && changeObj.reason.trim()
        ? changeObj.reason.trim()
        : "Rebalanced for improved cash flow stability.";

    // MoneyOS Deterministically recalculates difference: suggestedAmount - currentAmount
    const difference = Math.round((suggestedAmount - currentAmount) * 100) / 100;

    validChanges.push({
      categoryId: matchedCat.id,
      categoryTitle: matchedCat.title,
      itemName,
      currentAmount,
      suggestedAmount,
      difference,
      reason,
    });
  }

  const expectedOutcome =
    typeof obj.expectedOutcome === "string" && obj.expectedOutcome.trim()
      ? obj.expectedOutcome.trim()
      : "Improved monthly budget balance and financial resilience.";

  const priorityActions = Array.isArray(obj.priorityActions)
    ? obj.priorityActions
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim())
    : ["Review suggested reallocations.", "Prioritize fixed obligations first."];

  return {
    summary: obj.summary.trim(),
    problem: {
      type: problemType,
      amount: Math.round(problemAmount * 100) / 100,
      description: problemDesc,
    },
    changes: validChanges,
    expectedOutcome,
    priorityActions,
  };
}

/**
 * Deterministic MoneyOS Optimization Engine Calculator.
 * Takes the current AI proposed plan and temporary optimization changes,
 * recalculates category totals, total spending, savings, safety buffer,
 * remaining money, and before vs proposed improvements.
 */
export function recalculateOptimizationProposal(
  context: SanitizedPlannerContext,
  currentProposal: AIProposedPlan,
  optimization: AIOptimizationResultData
): OptimizationBeforeAfterSummary {
  // 1. Deep clone current proposal categories
  const updatedCategories: AIDetailedCategory[] = JSON.parse(
    JSON.stringify(currentProposal.categories)
  );

  // 2. Apply proposed changes ONLY to temporary categories object
  for (const change of optimization.changes) {
    let cat = updatedCategories.find((c) => c.id === change.categoryId);
    if (!cat) {
      cat = {
        id: change.categoryId,
        title: change.categoryTitle,
        currentAmount: change.currentAmount,
        suggestedTotal: change.suggestedAmount,
        items: [],
      };
      updatedCategories.push(cat);
    }

    // Look for existing item by name match
    const existingItem = cat.items.find(
      (i) =>
        i.name.toLowerCase().trim() === change.itemName.toLowerCase().trim() ||
        i.name.toLowerCase().includes(change.itemName.toLowerCase()) ||
        change.itemName.toLowerCase().includes(i.name.toLowerCase())
    );

    if (existingItem) {
      existingItem.amount = change.suggestedAmount;
      if (change.reason) existingItem.reason = change.reason;
    } else {
      cat.items.push({
        name: change.itemName,
        amount: change.suggestedAmount,
        reason: change.reason,
      });
    }

    // Deterministically recalculate category total as sum of sub-items
    cat.suggestedTotal = Math.round(cat.items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
  }

  // 3. Compute BEFORE values from currentProposal
  let beforeSpending = 0;
  let beforeSavings = 0;
  let beforeSafetyBuffer = 0;

  for (const cat of currentProposal.categories) {
    if (cat.id === "savings_future") {
      for (const item of cat.items) {
        if (/buffer|emergency/i.test(item.name)) {
          beforeSafetyBuffer += item.amount;
        } else {
          beforeSavings += item.amount;
        }
      }
    } else {
      beforeSpending += cat.suggestedTotal;
    }
  }

  if (beforeSavings === 0 && context.savingsGoalAmount > 0) {
    beforeSavings = context.savingsGoalAmount;
  }
  if (beforeSafetyBuffer === 0 && context.safetyBuffer > 0) {
    beforeSafetyBuffer = context.safetyBuffer;
  }

  const beforeAllocations = beforeSpending + beforeSavings + beforeSafetyBuffer;
  const beforeRemainingMoney = Math.round((context.plannedMonthlyIncome - beforeAllocations) * 100) / 100;

  // 4. Compute PROPOSED values from updatedCategories
  let proposedSpending = 0;
  let proposedSavings = 0;
  let proposedSafetyBuffer = 0;

  for (const cat of updatedCategories) {
    if (cat.id === "savings_future") {
      for (const item of cat.items) {
        if (/buffer|emergency/i.test(item.name)) {
          proposedSafetyBuffer += item.amount;
        } else {
          proposedSavings += item.amount;
        }
      }
    } else {
      proposedSpending += cat.suggestedTotal;
    }
  }

  if (proposedSavings === 0 && context.savingsGoalAmount > 0) {
    proposedSavings = context.savingsGoalAmount;
  }
  if (proposedSafetyBuffer === 0 && context.safetyBuffer > 0) {
    proposedSafetyBuffer = context.safetyBuffer;
  }

  const proposedAllocations = proposedSpending + proposedSavings + proposedSafetyBuffer;
  const proposedRemainingMoney = Math.round((context.plannedMonthlyIncome - proposedAllocations) * 100) / 100;

  // 5. Compute deterministic improvement deltas
  const spendingDifference = Math.round((proposedSpending - beforeSpending) * 100) / 100;
  const savingsDifference = Math.round((proposedSavings - beforeSavings) * 100) / 100;
  const safetyBufferDifference = Math.round((proposedSafetyBuffer - beforeSafetyBuffer) * 100) / 100;
  const remainingMoneyDifference = Math.round((proposedRemainingMoney - beforeRemainingMoney) * 100) / 100;

  return {
    planningMonth: context.planningMonth,
    plannedMonthlyIncome: context.plannedMonthlyIncome,
    before: {
      totalSpending: Math.round(beforeSpending * 100) / 100,
      totalSavings: Math.round(beforeSavings * 100) / 100,
      safetyBuffer: Math.round(beforeSafetyBuffer * 100) / 100,
      remainingMoney: beforeRemainingMoney,
      isAffordable: beforeRemainingMoney >= 0,
    },
    proposed: {
      totalSpending: Math.round(proposedSpending * 100) / 100,
      totalSavings: Math.round(proposedSavings * 100) / 100,
      safetyBuffer: Math.round(proposedSafetyBuffer * 100) / 100,
      remainingMoney: proposedRemainingMoney,
      isAffordable: proposedRemainingMoney >= 0,
    },
    improvement: {
      spendingDifference,
      savingsDifference,
      safetyBufferDifference,
      remainingMoneyDifference,
      isShortfallResolved: beforeRemainingMoney < 0 && proposedRemainingMoney >= 0,
    },
    updatedCategories,
  };
}

/**
 * Server-only service function that calls Groq AI provider to generate AI budget optimization
 * based on current planner context and current proposed life budget.
 */
export async function generateOptimizedAIPlan(
  context: SanitizedPlannerContext,
  currentProposal: AIProposedPlan,
  mode: OptimizationMode = "auto"
): Promise<AIOptimizationResult> {
  try {
    const provider = getAIProvider();

    // Format current categories and items for prompt
    const categoryDetailsPrompt = currentProposal.categories
      .map(
        (c) =>
          `- Category [${c.id}] ${c.title} (Total: ₹${c.suggestedTotal}): ` +
          c.items.map((i) => `${i.name}: ₹${i.amount}`).join(", ")
      )
      .join("\n");

    const modePromptMap: Record<OptimizationMode, string> = {
      auto: "Identify key budget problems (shortfall, high discretionary, low savings) and propose best overall rebalancing.",
      fix_shortfall: "Focus specifically on eliminating any monthly cash flow shortfall by reducing controllable variable spending.",
      increase_savings: "Focus on maximizing savings allocation while maintaining essential living expenses.",
      protect_safety_buffer: "Focus on protecting and building the emergency safety buffer reserve.",
      reduce_discretionary: "Focus on reducing non-essential lifestyle and discretionary spending sub-factors.",
    };

    const promptText = `Monthly Financial Planning Context:
- Planning Month: ${context.planningMonth}
- Planned Monthly Income: ₹${context.plannedMonthlyIncome}
- Savings Goal Target: ₹${context.savingsGoalAmount}
- Safety Buffer Reserve: ₹${context.safetyBuffer}
- Deterministic Remaining Money: ₹${context.remainingMoney}
- Current Plan Status: ${context.isAffordable ? "Surplus (Affordable)" : "Deficit (Shortfall)"}

Current AI Proposed Category Breakdown:
${categoryDetailsPrompt}

Optimization Intent / Mode: ${modePromptMap[mode] || modePromptMap.auto}

Please analyze this budget plan and return specific, practical sub-factor rebalancing changes to optimize the plan. Output strictly valid JSON matching the schema.`;

    const response = await provider.generateStructured<AIOptimizationResultData>({
      prompt: promptText,
      systemPrompt: OPTIMIZE_PLAN_SYSTEM_PROMPT,
      schemaDescription: OPTIMIZE_PLAN_SCHEMA_DESCRIPTION,
      temperature: 0.2,
      maxTokens: 1800,
    });

    const validated = validateAIOptimizationResultData(response.data);
    if (!validated) {
      console.error("AI Budget Optimization validation failed:", response.rawText);
      return {
        success: false,
        error: "AI budget optimization is temporarily unavailable. Your saved planner data is safe.",
      };
    }

    // MoneyOS Engine Recalculation (Authoritative Arithmetic)
    const recalculated = recalculateOptimizationProposal(context, currentProposal, validated);

    return {
      success: true,
      optimization: validated,
      recalculated,
    };
  } catch (error) {
    console.error("Error calling Groq AI provider for budget optimization:", error);
    return {
      success: false,
      error: "AI budget optimization is temporarily unavailable. Your saved planner data is safe.",
    };
  }
}



