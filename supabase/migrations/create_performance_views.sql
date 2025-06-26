/*
  # Performance Optimization with Materialized Views

  1. Materialized Views
    - `weekly_summary_cache` - Pre-aggregated weekly fitness data
    - `monthly_trends` - Monthly trend analysis
    - `user_stats_cache` - User statistics cache

  2. Indexes
    - Composite indexes for common queries
    - Partial indexes for filtered queries
*/

-- Create weekly summary materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_summary_cache AS
SELECT 
  fp.user_id,
  date_trunc('week', nl.date) as week_start,
  COUNT(DISTINCT nl.date) as days_logged,
  SUM(nl.calories) as total_calories,
  AVG(nl.calories) as avg_daily_calories,
  SUM(nl.protein_g) as total_protein,
  SUM(nl.carbs_g) as total_carbs,
  SUM(nl.fat_g) as total_fat,
  COUNT(DISTINCT ws.id) as workout_count,
  SUM(ws.duration_minutes) as total_workout_minutes,
  SUM(ws.calories_burned) as total_calories_burned,
  AVG(hl.daily_total) as avg_daily_hydration
FROM fitness_profiles fp
LEFT JOIN nutrition_logs nl ON fp.user_id = nl.user_id
LEFT JOIN workout_sessions ws ON fp.user_id = ws.user_id AND ws.workout_date = nl.date
LEFT JOIN (
  SELECT user_id, date, SUM(amount_ml) as daily_total
  FROM hydration_logs
  GROUP BY user_id, date
) hl ON fp.user_id = hl.user_id AND hl.date = nl.date
WHERE nl.date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY fp.user_id, date_trunc('week', nl.date);

-- Create monthly trends materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_trends AS
SELECT 
  user_id,
  date_trunc('month', log_date) as month,
  AVG(weight_kg) as avg_weight,
  MIN(weight_kg) as min_weight,
  MAX(weight_kg) as max_weight,
  AVG(body_fat_percentage) as avg_body_fat,
  AVG(resting_heart_rate) as avg_resting_hr
FROM body_metrics_history
WHERE log_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY user_id, date_trunc('month', log_date);

-- Create user stats cache
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats_cache AS
SELECT 
  fp.user_id,
  fp.fitness_goal,
  COUNT(DISTINCT ua.achievement_id) as total_achievements,
  SUM(ua.progress) as total_achievement_points,
  COUNT(DISTINCT cp.challenge_id) as active_challenges,
  (
    SELECT COUNT(*) 
    FROM workout_sessions ws 
    WHERE ws.user_id = fp.user_id 
    AND ws.workout_date >= CURRENT_DATE - INTERVAL '30 days'
  ) as workouts_last_30_days,
  (
    SELECT AVG(calories) 
    FROM nutrition_logs nl 
    WHERE nl.user_id = fp.user_id 
    AND nl.date >= CURRENT_DATE - INTERVAL '7 days'
  ) as avg_calories_last_week
FROM fitness_profiles fp
LEFT JOIN user_achievements ua ON fp.user_id = ua.user_id
LEFT JOIN challenge_participants cp ON fp.user_id = cp.user_id
GROUP BY fp.user_id, fp.fitness_goal;

-- Create indexes for materialized views
CREATE UNIQUE INDEX idx_weekly_summary_user_week ON weekly_summary_cache(user_id, week_start);
CREATE UNIQUE INDEX idx_monthly_trends_user_month ON monthly_trends(user_id, month);
CREATE UNIQUE INDEX idx_user_stats_user ON user_stats_cache(user_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_user_date ON workout_sessions(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_hydration_user_date ON hydration_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON body_metrics_history(user_id, log_date DESC);

-- Create partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_active_challenges ON social_fitness_challenges(start_date, end_date) 
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_recent_workouts ON workout_sessions(user_id, workout_date) 
WHERE workout_date >= CURRENT_DATE - INTERVAL '30 days';

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_fitness_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_summary_cache;
  REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_trends;
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats_cache;
END;
$$ LANGUAGE plpgsql;
