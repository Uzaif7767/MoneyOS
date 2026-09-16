import 'server-only';

export type AICoachIntent =
  | 'balance'
  | 'spending'
  | 'spending_category'
  | 'bills'
  | 'safe_to_spend'
  | 'goals'
  | 'savings'
  | 'planner'
  | 'financial_overview'
  | 'budgeting'
  | 'general_finance'
  | 'unknown';

export interface IntentDetectionResult {
  intent: AICoachIntent;
  requestedAmount?: number;
  targetCategory?: string;
  confidence: 'high' | 'medium' | 'low';
}

export type AICoachActionIntent =
  | 'create_expense'
  | 'edit_expense'
  | 'delete_expense'
  | 'create_bill'
  | 'edit_bill'
  | 'mark_bill_paid'
  | 'create_goal'
  | 'edit_goal'
  | 'delete_goal'
  | 'modify_planner'
  | 'modify_settings'
  | 'payment'
  | 'transfer'
  | 'external_action'
  | 'prompt_inspection'
  | 'unknown_action'
  | 'none';

export interface ActionDetectionResult {
  actionIntent: AICoachActionIntent;
  refusalMessage?: string;
}

/**
 * Lightweight server-side detection for action-oriented requests and prompt mutations.
 * Returns a safe refusal message if the user asks to modify records, execute payments, or inspect system secrets.
 */
export function detectActionIntent(userMessage: string): ActionDetectionResult {
  if (!userMessage || typeof userMessage !== 'string') {
    return { actionIntent: 'none' };
  }

  const normalized = userMessage.toLowerCase().trim();

  const has = (pattern: RegExp | string) => {
    if (typeof pattern === 'string') {
      return normalized.includes(pattern);
    }
    return pattern.test(normalized);
  };

  // 1. Prompt Inspection & Secret Leak Attempts
  if (
    has(/ignore (?:previous|all|system) (?:instructions|prompts|rules)/i) ||
    has(/show (?:me )?(?:the )?(?:system|hidden) (?:prompt|instructions|rules)/i) ||
    has(/what is your (?:system|hidden) (?:prompt|instructions)/i) ||
    has(/reveal (?:system|api|firebase|credentials|secret)/i) ||
    has(/(?:api key|firebase key|clerk id|auth token|secret key)/i)
  ) {
    return {
      actionIntent: 'prompt_inspection',
      refusalMessage:
        "I am MoneyOS AI Coach, a read-only personal financial assistant. System instructions, API keys, and internal credentials cannot be disclosed.",
    };
  }

  // 2. Admin / System Mutation Overrides
  if (
    has(/you are now (?:admin|root|system|developer|god mode)/i) ||
    has(/override (?:security|safety|read-only|rules)/i) ||
    has(/execute (?:database|transaction|command|script)/i)
  ) {
    return {
      actionIntent: 'unknown_action',
      refusalMessage:
        "AI Coach is strictly a read-only assistant. I cannot execute administrative commands or modify your MoneyOS records.",
    };
  }

  // 3. Expense Mutations (Create, Edit, Delete)
  if (
    !has(/(?:can i|should i|how much|where did|did i|what if|why did|how to)/i) &&
    (
      has(/(?:add|create|record|log|insert|save|dalo|daalo|likho)\s+(?:an?\s+)?(?:new\s+)?(?:expense|kharcha)/i) ||
      has(/(?:expense|kharcha)\s+(?:add|create|record|log|dalo|daalo|likho|save)/i) ||
      has(/add\s+(?:₹|inr|rs\.?|rupees)?\s*\d+.*(?:expense|for|on|kharcha)/i) ||
      has(/spent\s+(?:₹|inr|rs\.?|rupees)?\s*\d+.*(?:add it|record it|save it|log it)/i)
    )
  ) {
    return {
      actionIntent: 'create_expense',
      refusalMessage:
        "Main Expenses mein directly change nahi kar sakta. Aap Expenses section se ise manually add kar sakte ho. (I can't add expenses from chat, but you can add expenses from Expenses.)",
    };
  }

  if (
    has(/(?:edit|change|update|modify)\s+(?:my\s+)?(?:the\s+)?(?:last\s+)?expense/i) ||
    has(/expense\s+(?:edit|change|update|badlo)/i)
  ) {
    return {
      actionIntent: 'edit_expense',
      refusalMessage:
        "Main Expenses edit nahi kar sakta. Aap Expenses section se manually update kar sakte ho.",
    };
  }

  if (
    has(/(?:delete|remove|erase|clear)\s+(?:my\s+)?(?:the\s+)?(?:last\s+)?expense/i) ||
    has(/expense\s+(?:delete|remove|hatao)/i) ||
    has(/kharcha\s+(?:hatao|delete)/i)
  ) {
    return {
      actionIntent: 'delete_expense',
      refusalMessage:
        "Main Expenses delete nahi kar sakta. Aap Expenses section se manually remove kar sakte ho.",
    };
  }

  // 4. Bill Mutations (Create, Edit, Mark Paid)
  if (
    has(/(?:mark|set)\s+.*(?:bill|utility).*(?:as\s+)?paid/i) ||
    has(/bill\s+paid\s+mark/i) ||
    has(/bill\s+(?:ko\s+)?paid\s+(?:mark|kar)/i) ||
    has(/mark\s+(?:my\s+)?(?:bill|bills)\s+paid/i)
  ) {
    return {
      actionIntent: 'mark_bill_paid',
      refusalMessage:
        "AI Coach bill ko paid mark nahi kar sakta. Aap Bills section se manually update kar sakte ho. (I can't change bill status from chat. You can mark it paid from Bills.)",
    };
  }

  if (
    !has(/(?:upcoming|unpaid|due|when|what|how much|list|show|view)/i) &&
    (
      has(/(?:add|create|record|insert)\s+(?:a\s+)?(?:new\s+)?bill/i) ||
      has(/bill\s+(?:add|create|banao|dalo)/i)
    )
  ) {
    return {
      actionIntent: 'create_bill',
      refusalMessage:
        "AI Coach se new bill add nahi ho sakta. Aap Bills section se new bill create kar sakte ho.",
    };
  }

  if (
    has(/(?:edit|change|update|modify|reschedule)\s+(?:my\s+)?(?:the\s+)?bill/i) ||
    has(/bill\s+(?:edit|change|update|badlo)/i)
  ) {
    return {
      actionIntent: 'edit_bill',
      refusalMessage:
        "AI Coach bill details update nahi kar sakta. Aap Bills section se edit kar sakte ho.",
    };
  }

  // 5. Goal Mutations (Create, Edit, Delete)
  if (
    !has(/(?:how|what|my|active|current|progress|close to|status)/i) &&
    (
      has(/(?:create|add|set up|start)\s+(?:a\s+)?(?:new\s+)?(?:savings\s+)?goal/i) ||
      has(/goal\s+(?:create|add|banao)/i)
    )
  ) {
    return {
      actionIntent: 'create_goal',
      refusalMessage:
        "I can't create savings goals from chat. You can set up a new goal directly in the Goals section.",
    };
  }

  if (
    has(/(?:increase|decrease|change|edit|update|modify|set)\s+(?:my\s+)?(?:savings\s+)?goal/i) ||
    has(/goal\s+(?:target|amount)\s+(?:change|increase|badhao|update)/i) ||
    has(/add\s+(?:contribution|money)\s+to\s+goal/i)
  ) {
    return {
      actionIntent: 'edit_goal',
      refusalMessage:
        "I can't modify savings goals from chat. You can update your goal target or progress directly in the Goals section.",
    };
  }

  if (
    has(/(?:delete|remove)\s+(?:my\s+)?(?:savings\s+)?goal/i) ||
    has(/goal\s+(?:delete|remove|hatao)/i)
  ) {
    return {
      actionIntent: 'delete_goal',
      refusalMessage:
        "I can't delete savings goals from chat. You can remove a goal directly in the Goals section.",
    };
  }

  // 6. Planner Modifications
  if (
    !has(/(?:explain|what is|summary|show|view|review)/i) &&
    (
      has(/(?:edit|modify|update|change|save|overwrite|approve)\s+(?:my\s+)?(?:monthly\s+)?plan(?:ner)?/i) ||
      has(/plan(?:ner)?\s+(?:edit|modify|update|save|change|set)/i) ||
      has(/set\s+planner\s+allocation/i)
    )
  ) {
    return {
      actionIntent: 'modify_planner',
      refusalMessage:
        "I can't edit or save planner allocations from chat. Open Monthly Planner to make changes.",
    };
  }

  // 7. Settings Modifications
  if (
    !has(/(?:what is|how much|show|view)/i) &&
    (
      has(/(?:change|update|set|modify)\s+(?:my\s+)?(?:monthly\s+)?(?:income|salary|balance|safety buffer|settings)/i) ||
      has(/(?:income|salary|balance|safety buffer)\s+(?:change|update|badlo)/i) ||
      has(/update\s+settings/i)
    )
  ) {
    return {
      actionIntent: 'modify_settings',
      refusalMessage:
        "I can't change your financial settings or income from chat. Open Settings to update your setup.",
    };
  }

  // 8. Payment, Transfer & External Actions
  if (
    has(/(?:make|execute|process|do)\s+(?:a\s+)?payment/i) ||
    has(/pay\s+(?:₹|inr|rs\.?|rupees)?\s*\d+/i) ||
    has(/(?:transfer|send)\s+(?:money|paise|funds|(?:₹|inr|rs\.?|rupees)?\s*\d+)/i) ||
    has(/(?:upi|gpay|google pay|phonepe|paytm)\s+(?:payment|se pay|transfer)/i) ||
    has(/(?:connect|link)\s+(?:my\s+)?bank/i)
  ) {
    return {
      actionIntent: 'payment',
      refusalMessage:
        "I can't perform financial transactions or external actions from AI Coach. MoneyOS AI Coach is strictly a read-only assistant.",
    };
  }

  return { actionIntent: 'none' };
}

const CATEGORY_MAP: Record<string, string> = {
  food: 'Food & Dining',
  dining: 'Food & Dining',
  restaurant: 'Food & Dining',
  eating: 'Food & Dining',
  zomato: 'Food & Dining',
  swiggy: 'Food & Dining',
  shopping: 'Shopping',
  clothes: 'Shopping',
  amazon: 'Shopping',
  flipkart: 'Shopping',
  rent: 'Housing & Rent',
  housing: 'Housing & Rent',
  house: 'Housing & Rent',
  fuel: 'Transportation & Fuel',
  petrol: 'Transportation & Fuel',
  diesel: 'Transportation & Fuel',
  cab: 'Transportation & Fuel',
  uber: 'Transportation & Fuel',
  ola: 'Transportation & Fuel',
  travel: 'Transportation & Fuel',
  transport: 'Transportation & Fuel',
  bills: 'Bills & Utilities',
  bill: 'Bills & Utilities',
  electricity: 'Bills & Utilities',
  wifi: 'Bills & Utilities',
  water: 'Bills & Utilities',
  entertainment: 'Entertainment',
  movies: 'Entertainment',
  netflix: 'Entertainment',
  healthcare: 'Healthcare',
  medical: 'Healthcare',
  doctor: 'Healthcare',
  education: 'Education',
  school: 'Education',
  college: 'Education',
  subscriptions: 'Subscriptions',
  personal: 'Personal Care',
  investment: 'Investment & Savings',
};

/**
 * Server-side deterministic intent detector for MoneyOS AI Coach.
 * Classifies query intent based on rule-based semantic/keyword matching for English & Hinglish.
 * Supports context-aware resolution of follow-up questions using recent conversation history.
 */
export function detectUserIntent(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): IntentDetectionResult {
  if (!userMessage || typeof userMessage !== 'string') {
    return { intent: 'unknown', confidence: 'low' };
  }

  const normalized = userMessage.toLowerCase().trim();

  // 1. Extract requested spending amount if user is asking about affordability or specific spending
  let requestedAmount: number | undefined = undefined;
  
  // Patterns like "can I spend ₹2000", "can I afford 5,000", "₹1,500 spend kar sakta hu", "what if I spend 2,000", "aur agar 2000 uda du"
  const amountRegex = /(?:(?:can\s+i\s+(?:spend|afford|buy)|afford\s+to\s+spend|spend|afford|kharcha\s+kar|karlu|uda\s+du|buy|what\s+if\s+i\s+spend|agar|uda\s+du)\s*)?(?:₹|inr|rs\.?|rupees)?\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)\s*(?:₹|inr|rs\.?|rupees)?/i;
  
  const amountMatch = normalized.match(amountRegex);
  if (amountMatch && amountMatch[1]) {
    const parsed = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (!isNaN(parsed) && parsed > 0 && parsed < 10000000) {
      if (
        normalized.includes('can i') ||
        normalized.includes('afford') ||
        normalized.includes('spend') ||
        normalized.includes('buy') ||
        normalized.includes('uda') ||
        normalized.includes('kharch') ||
        normalized.includes('what if') ||
        normalized.includes('agar')
      ) {
        requestedAmount = parsed;
      }
    }
  }

  // 2. Extract potential target category
  let targetCategory: string | undefined = undefined;
  for (const [key, categoryName] of Object.entries(CATEGORY_MAP)) {
    const keyRegex = new RegExp(`\\b${key}\\b`, 'i');
    if (keyRegex.test(normalized)) {
      targetCategory = categoryName;
      break;
    }
  }

  // 3. Standalone Intent Matching (High to Low Priority)

  // SAFE TO SPEND
  if (
    normalized.includes('safe to spend') ||
    normalized.includes('safe-to-spend') ||
    normalized.includes('safe spend') ||
    normalized.includes('can i spend') ||
    normalized.includes('can i afford') ||
    normalized.includes('how much can i spend') ||
    normalized.includes('aaj kitna spend') ||
    normalized.includes('aaj kitna uda') ||
    normalized.includes('kitna spend kar') ||
    normalized.includes('safe to spend kitna') ||
    normalized.includes('why is my safe to spend') ||
    normalized.includes('daily safe spend') ||
    normalized.includes('daily allowance') ||
    (requestedAmount !== undefined && (normalized.includes('afford') || normalized.includes('spend') || normalized.includes('buy') || normalized.includes('uda')))
  ) {
    return { intent: 'safe_to_spend', requestedAmount, confidence: 'high' };
  }

  // BALANCE
  if (
    normalized.includes('current balance') ||
    normalized.includes('my balance') ||
    normalized.includes('account balance') ||
    normalized.includes('what is my balance') ||
    normalized.includes('how much money do i have') ||
    normalized.includes('kitna paisa bacha hai') ||
    normalized.includes('mere paas abhi kitne paise') ||
    normalized.includes('kitna balance hai') ||
    normalized.includes('kitne paise hain') ||
    normalized.includes('paisa kitna hai') ||
    normalized.includes('total balance')
  ) {
    return { intent: 'balance', confidence: 'high' };
  }

  // SPENDING CATEGORY / WHERE DID MONEY GO
  if (
    normalized.includes('where did i spend') ||
    normalized.includes('where did my money go') ||
    normalized.includes('where is my money going') ||
    normalized.includes('where did most of it go') ||
    normalized.includes('most of it go') ||
    normalized.includes('iss month kaha zyada') ||
    normalized.includes('kaha zyada kharcha') ||
    normalized.includes('mera paisa kaha ja raha') ||
    normalized.includes('top category') ||
    normalized.includes('most spending') ||
    normalized.includes('cost me the most') ||
    normalized.includes('highest spending') ||
    normalized.includes('spending breakdown') ||
    normalized.includes('category totals') ||
    normalized.includes('kharcha kaha hua') ||
    normalized.includes('kaha kharch hua') ||
    (targetCategory !== undefined && (normalized.includes('how much') || normalized.includes('spending on') || normalized.includes('spent on') || normalized.includes('kharcha')))
  ) {
    return { intent: 'spending_category', targetCategory, confidence: 'high' };
  }

  // SPENDING (GENERAL / TOTAL / MOM COMPARISON)
  if (
    normalized.includes('how much did i spend') ||
    normalized.includes('spent this month') ||
    normalized.includes('total spending') ||
    normalized.includes('total spend') ||
    normalized.includes('kitna kharcha hua') ||
    normalized.includes('iss month kitna kharcha') ||
    normalized.includes('did i spend more') ||
    normalized.includes('spending more than last month') ||
    normalized.includes('how much more did i spend') ||
    normalized.includes('kharcha kitna hua') ||
    normalized.includes('recent expenses') ||
    normalized.includes('recent transactions') ||
    normalized.includes('my spending')
  ) {
    return { intent: 'spending', confidence: 'high' };
  }

  // BILLS
  if (
    normalized.includes('upcoming bill') ||
    normalized.includes('next bill') ||
    normalized.includes('bills coming up') ||
    normalized.includes('unpaid bill') ||
    normalized.includes('due date') ||
    normalized.includes('next bill kab') ||
    normalized.includes('bill kab hai') ||
    normalized.includes('when is my bill') ||
    normalized.includes('how much for bills') ||
    normalized.includes('bill payment') ||
    normalized.includes('pending bill') ||
    normalized.includes('what bills')
  ) {
    return { intent: 'bills', confidence: 'high' };
  }

  // GOALS
  if (
    normalized.includes('savings goal') ||
    normalized.includes('my goal') ||
    normalized.includes('goal complete') ||
    normalized.includes('kitna baaki hai') ||
    normalized.includes('close to my goal') ||
    normalized.includes('left for my goal') ||
    normalized.includes('goals doing') ||
    normalized.includes('active goal') ||
    normalized.includes('target amount') ||
    normalized.includes('goal progress')
  ) {
    return { intent: 'goals', confidence: 'high' };
  }

  // SAVINGS
  if (
    normalized.includes('save more') ||
    normalized.includes('how can i save') ||
    normalized.includes('how much have i saved') ||
    normalized.includes('kitna save kar') ||
    normalized.includes('saving money') ||
    normalized.includes('save money') ||
    normalized.includes('how to save') ||
    normalized.includes('savings breakdown')
  ) {
    return { intent: 'savings', confidence: 'high' };
  }

  // PLANNER
  if (
    normalized.includes('planner') ||
    normalized.includes('monthly plan') ||
    normalized.includes('planned spending') ||
    normalized.includes('plan summary') ||
    normalized.includes('explain my monthly plan') ||
    normalized.includes('budget plan') ||
    normalized.includes('money planner')
  ) {
    return { intent: 'planner', confidence: 'high' };
  }

  // FINANCIAL OVERVIEW
  if (
    normalized.includes('how am i doing financially') ||
    normalized.includes('quick money overview') ||
    normalized.includes('money overview') ||
    normalized.includes('financial overview') ||
    normalized.includes('what should i focus on') ||
    normalized.includes('financial status') ||
    normalized.includes('financial summary') ||
    normalized.includes('financial health') ||
    normalized.includes('finances overview') ||
    normalized.includes('overall money')
  ) {
    return { intent: 'financial_overview', confidence: 'high' };
  }

  // BUDGETING
  if (
    normalized.includes('budgeting') ||
    normalized.includes('how to budget') ||
    normalized.includes('create a budget') ||
    normalized.includes('budget rule')
  ) {
    return { intent: 'budgeting', confidence: 'medium' };
  }

  // GENERAL FINANCE
  if (
    normalized.includes('investment') ||
    normalized.includes('stocks') ||
    normalized.includes('mutual fund') ||
    normalized.includes('credit card') ||
    normalized.includes('emergency fund') ||
    normalized.includes('interest rate') ||
    normalized.includes('cibil')
  ) {
    return { intent: 'general_finance', confidence: 'medium' };
  }

  // 4. Follow-up Intent Resolution using Recent History Context
  if (history && history.length > 0) {
    let prevUserIntent: AICoachIntent = 'unknown';
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') {
        const prevResult = detectUserIntent(history[i].content);
        if (prevResult.intent !== 'unknown') {
          prevUserIntent = prevResult.intent;
          break;
        }
      }
    }

    if (
      normalized.includes('which one is the biggest') ||
      normalized.includes('which one is biggest') ||
      normalized.includes('biggest one') ||
      normalized.includes('kon sa sabse bada')
    ) {
      if (prevUserIntent === 'bills') {
        return { intent: 'bills', confidence: 'high' };
      }
      if (prevUserIntent === 'goals') {
        return { intent: 'goals', confidence: 'high' };
      }
      if (prevUserIntent === 'spending' || prevUserIntent === 'spending_category') {
        return { intent: 'spending_category', confidence: 'high' };
      }
    }

    if (
      normalized.includes('last month') ||
      normalized.includes('pichle month') ||
      normalized.includes('previous month') ||
      normalized.includes('pichhla mahina')
    ) {
      if (prevUserIntent === 'spending' || prevUserIntent === 'spending_category' || prevUserIntent === 'financial_overview') {
        return { intent: 'spending', confidence: 'high' };
      }
    }

    if (requestedAmount !== undefined && (prevUserIntent === 'safe_to_spend' || prevUserIntent === 'balance')) {
      return { intent: 'safe_to_spend', requestedAmount, confidence: 'high' };
    }

    if (
      normalized.includes('can i afford it') ||
      normalized.includes('afford it') ||
      normalized.includes('how much is that')
    ) {
      if (prevUserIntent === 'safe_to_spend') {
        return { intent: 'safe_to_spend', confidence: 'medium' };
      }
      if (prevUserIntent === 'bills') {
        return { intent: 'bills', confidence: 'medium' };
      }
    }

    if (
      prevUserIntent !== 'unknown' &&
      (normalized.includes(' it') || normalized.includes(' that') || normalized.includes(' this') || normalized.includes(' aur '))
    ) {
      return { intent: prevUserIntent, confidence: 'medium' };
    }
  }

  return { intent: 'unknown', confidence: 'low' };
}
