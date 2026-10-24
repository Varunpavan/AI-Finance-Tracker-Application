import OpenAI from 'openai'
import { analyzeFinance } from './financeAnalyzer.js'

let hasOpenAIKey = () => {
  let key = process.env.OPENAI_API_KEY
  if (!key) return false
  if (!key.trim()) return false
  if (key.includes('your_')) return false
  return true
}

let generateAIInsights = async ({ transactions, budget }) => {
  let analysis = analyzeFinance({ transactions, budget })

  let fallback = () => {
    return {
      provider: 'heuristic',
      insights: [...analysis.insights, ...analysis.recommendations].slice(0, 8)
    }
  }

  // If no OpenAI API key is supplied, use the built-in heuristic analysis engine
  if (!hasOpenAIKey()) {
    return fallback()
  }

  try {
    let client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    let prompt = `You are a personal finance assistant. Based on this spending summary, give 5-8 short, specific, actionable insights as a JSON array of strings (no markdown, no extra text).

Summary: ${JSON.stringify({
      totalIncome: analysis.totalIncome,
      totalExpense: analysis.totalExpense,
      savings: analysis.savings,
      monthlyBudget: analysis.monthlyBudget,
      budgetRemaining: analysis.budgetRemaining,
      categoryBreakdown: analysis.categoryBreakdown
    })}`

    let response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    })

    let raw = response.choices?.[0]?.message?.content || ''
    let cleaned = raw.replace(/```json|```/g, '').trim()
    let parsed = JSON.parse(cleaned)

    return {
      provider: 'openai',
      insights: Array.isArray(parsed) && parsed.length > 0 ? parsed : analysis.insights
    }
  } catch (error) {
    return fallback()
  }
}

let predictExpense = async ({ transactions, budget }) => {
  let analysis = analyzeFinance({ transactions, budget })

  let budgetRisk = false
  if (analysis.monthlyBudget > 0 && analysis.predictedExpense > analysis.monthlyBudget) {
    budgetRisk = true
  }

  return {
    predictedExpense: analysis.predictedExpense,
    confidence: analysis.confidence,
    budgetRisk,
    recommendations: analysis.recommendations
  }
}

export { generateAIInsights, predictExpense }
