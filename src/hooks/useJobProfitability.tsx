import { useMemo } from 'react';
import { useInvoices, Invoice } from './useInvoices';
import { useQuotes } from './useQuotes';

export interface JobProfitability {
  invoiceId: string;
  invoiceNumber: string;
  quoteNumber?: string;
  clientName: string;
  date: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  marginPercent: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
}

export interface ProfitabilityStats {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  averageMargin: number;
  jobsTracked: number;
  jobsAboveTarget: number;
  jobsBelowTarget: number;
  bestJob: JobProfitability | null;
  worstJob: JobProfitability | null;
}

export interface MonthlyProfitability {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ClientProfitability {
  clientName: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  averageMargin: number;
  jobCount: number;
}

const TARGET_MARGIN = 25; // Default target margin percentage

function getMarginStatus(margin: number): 'excellent' | 'good' | 'warning' | 'poor' {
  if (margin >= 30) return 'excellent';
  if (margin >= 15) return 'good';
  if (margin >= 5) return 'warning';
  return 'poor';
}

export function useJobProfitability() {
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { quotes, isLoading: quotesLoading } = useQuotes();

  const isLoading = invoicesLoading || quotesLoading;

  // Calculate profitability for each paid invoice
  const jobProfitabilities = useMemo<JobProfitability[]>(() => {
    return invoices
      .filter(invoice => invoice.status === 'paid')
      .map(invoice => {
        // Find linked quote
        const linkedQuote = quotes.find(q => q.id === invoice.sourceQuoteId);
        
        // Calculate revenue and cost from line items
        const revenue = invoice.lineItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice, 
          0
        );
        const cost = invoice.lineItems.reduce(
          (sum, item) => sum + item.quantity * (item.costPrice || 0), 
          0
        );
        
        const grossProfit = revenue - cost;
        const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

        return {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          quoteNumber: linkedQuote?.quoteNumber,
          clientName: invoice.clientName,
          date: invoice.date,
          revenue,
          cost,
          grossProfit,
          marginPercent,
          status: getMarginStatus(marginPercent),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, quotes]);

  // Calculate overall stats
  const stats = useMemo<ProfitabilityStats>(() => {
    if (jobProfitabilities.length === 0) {
      return {
        totalRevenue: 0,
        totalCost: 0,
        grossProfit: 0,
        averageMargin: 0,
        jobsTracked: 0,
        jobsAboveTarget: 0,
        jobsBelowTarget: 0,
        bestJob: null,
        worstJob: null,
      };
    }

    const totalRevenue = jobProfitabilities.reduce((sum, job) => sum + job.revenue, 0);
    const totalCost = jobProfitabilities.reduce((sum, job) => sum + job.cost, 0);
    const grossProfit = totalRevenue - totalCost;
    const averageMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    const jobsAboveTarget = jobProfitabilities.filter(j => j.marginPercent >= TARGET_MARGIN).length;
    const jobsBelowTarget = jobProfitabilities.filter(j => j.marginPercent < TARGET_MARGIN).length;

    // Find best and worst jobs
    const sortedByMargin = [...jobProfitabilities].sort((a, b) => b.marginPercent - a.marginPercent);
    const bestJob = sortedByMargin[0] || null;
    const worstJob = sortedByMargin[sortedByMargin.length - 1] || null;

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      averageMargin,
      jobsTracked: jobProfitabilities.length,
      jobsAboveTarget,
      jobsBelowTarget,
      bestJob,
      worstJob,
    };
  }, [jobProfitabilities]);

  // Monthly breakdown for charts
  const monthlyData = useMemo<MonthlyProfitability[]>(() => {
    const monthMap = new Map<string, { revenue: number; cost: number; profit: number }>();
    
    jobProfitabilities.forEach(job => {
      const date = new Date(job.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = monthMap.get(monthKey) || { revenue: 0, cost: 0, profit: 0 };
      monthMap.set(monthKey, {
        revenue: existing.revenue + job.revenue,
        cost: existing.cost + job.cost,
        profit: existing.profit + job.grossProfit,
      });
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [jobProfitabilities]);

  // Client profitability analysis
  const clientProfitability = useMemo<ClientProfitability[]>(() => {
    const clientMap = new Map<string, { revenue: number; cost: number; count: number }>();
    
    jobProfitabilities.forEach(job => {
      const existing = clientMap.get(job.clientName) || { revenue: 0, cost: 0, count: 0 };
      clientMap.set(job.clientName, {
        revenue: existing.revenue + job.revenue,
        cost: existing.cost + job.cost,
        count: existing.count + 1,
      });
    });

    return Array.from(clientMap.entries())
      .map(([clientName, data]) => {
        const grossProfit = data.revenue - data.cost;
        const averageMargin = data.revenue > 0 ? (grossProfit / data.revenue) * 100 : 0;
        return {
          clientName,
          totalRevenue: data.revenue,
          totalCost: data.cost,
          grossProfit,
          averageMargin,
          jobCount: data.count,
        };
      })
      .sort((a, b) => b.grossProfit - a.grossProfit);
  }, [jobProfitabilities]);

  return {
    jobProfitabilities,
    stats,
    monthlyData,
    clientProfitability,
    isLoading,
    targetMargin: TARGET_MARGIN,
  };
}
