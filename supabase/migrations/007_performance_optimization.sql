/*
  # Performance Optimization

  1. Materialized Views
    - Weekly summary cache for faster dashboard loading
    
  2. Indexes
    - Composite indexes for common queries
    - Partial indexes for filtered queries

  3. Purpose
    - Improve query performance
    - Reduce database load
*/

-- Create materialized view for weekly summaries
CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_summary_cache AS
SELECT 
  u.user_id,
  date_trunc('week', n.log_date) as week_start,
  COUNT(DISTINCT n.log_date) as days_logged,
  AVG(n.calories) as avg_daily_calories,
  AVG(n.protein_g) as avg_daily_protein,
  AVG(n.carbs_g) as avg_daily_carbs,
  AVG(n.fat_g) as avg_daily_fat,
  COUNT(DISTINCT w.workout_date) as workout_days,
  SUM(w.duration_minutes) as total_workout_minutes,
  SUM(w.calories_burned) as total_calories_burned
FROM users u
LEFT JOIN nutrition_logs n ON u.id = n.user_id
LEFT JOIN workout_sessions w ON u.id = w.user_id 
  AND w.workout_date >= date_trunc('week', n.log_date) 
  AND w.workout_date < date_trunc('week', n.log_date) + interval '7 days'
WHERE n.log_date >= CURRENT_DATE - interval '90 days'
GROUP BY u.id, date_trunc('week', n.log_date);

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_weekly_summary_user_week ON weekly_summary_cache(user_id, week_start DESC);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date_meal ON nutrition_logs(user_id, log_date DESC, meal_type);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date_type ON workout_sessions(user_id, workout_date DESC, workout_type);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_date_time ON hydration_logs(user_id, log_date DESC, log_time);

-- Create partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_active_challenges ON social_fitness_challenges(end_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pending_achievements ON user_achievements(user_id) WHERE level_achieved IS NULL;

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_weekly_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_summary_cache;
END;
$$ LANGUAGE plpgsql;
