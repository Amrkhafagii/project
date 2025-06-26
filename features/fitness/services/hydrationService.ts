import { supabase } from '@/lib/supabase';
import { HydrationLog } from '../types';

export const hydrationService = {
  async getHydrationLogs(userId: string, date: string): Promise<HydrationLog[]> {
    const { data, error } = await supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date)
      .order('log_time', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addHydrationLog(userId: string, amountMl: number): Promise<HydrationLog> {
    const now = new Date();
    const log_date = now.toISOString().split('T')[0];
    const log_time = now.toTimeString().split(' ')[0];

    const { data, error } = await supabase
      .from('hydration_logs')
      .insert({
        user_id: userId,
        amount_ml: amountMl,
        log_date,
        log_time,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDailyHydration(userId: string, date: string): Promise<number> {
    const { data, error } = await supabase
      .from('hydration_logs')
      .select('amount_ml')
      .eq('user_id', userId)
      .eq('log_date', date);

    if (error) throw error;
    
    return data?.reduce((total, log) => total + log.amount_ml, 0) || 0;
  },

  async getWeeklyHydration(userId: string): Promise<{ date: string; amount: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);

    const { data, error } = await supabase
      .from('hydration_logs')
      .select('log_date, amount_ml')
      .eq('user_id', userId)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .lte('log_date', endDate.toISOString().split('T')[0]);

    if (error) throw error;

    // Group by date
    const grouped = data?.reduce((acc, log) => {
      if (!acc[log.log_date]) {
        acc[log.log_date] = 0;
      }
      acc[log.log_date] += log.amount_ml;
      return acc;
    }, {} as Record<string, number>) || {};

    // Convert to array and fill missing dates
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        amount: grouped[dateStr] || 0,
      });
    }

    return result;
  },
};
