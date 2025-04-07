-- Insert default categories for testing
INSERT INTO categories (user_id, name, color)
VALUES 
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Food & Dining', '#FF6B6B'),
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Transportation', '#4ECDC4'),
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Shopping', '#45B7D1'),
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Entertainment', '#96CEB4'),
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Health', '#D4A5A5'),
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Utilities', '#9B5DE5'),
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Housing', '#F15BB5'),
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Travel', '#FEE440'),
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Education', '#00BBF9'),
  ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'Other', '#98C1D9');

-- Insert default user settings
INSERT INTO user_settings (user_id, currency, theme)
VALUES ('user_2YTDFcQhxNcRpWQEEwJiJbKKlsj', 'USD', 'light');
