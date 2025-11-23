-- Insert default categories (System wide, user_id is NULL)

-- Income Categories
INSERT INTO public.categories (name, type, icon, color) VALUES
('Gaji', 'income', 'banknote', '#10b981'), -- Emerald
('Tunjangan', 'income', 'wallet', '#3b82f6'), -- Blue
('Bonus', 'income', 'gift', '#8b5cf6'), -- Violet
('Investasi', 'income', 'trending-up', '#f59e0b'), -- Amber
('Lainnya', 'income', 'more-horizontal', '#64748b'); -- Slate

-- Expense Categories
INSERT INTO public.categories (name, type, icon, color) VALUES
('Makanan', 'expense', 'utensils', '#ef4444'), -- Red
('Transportasi', 'expense', 'bus', '#f97316'), -- Orange
('Belanja', 'expense', 'shopping-bag', '#ec4899'), -- Pink
('Hiburan', 'expense', 'film', '#8b5cf6'), -- Violet
('Tagihan', 'expense', 'receipt', '#ef4444'), -- Red
('Kesehatan', 'expense', 'heart-pulse', '#ef4444'), -- Red
('Pendidikan', 'expense', 'graduation-cap', '#3b82f6'), -- Blue
('Investasi', 'expense', 'piggy-bank', '#f59e0b'), -- Amber
('Lainnya', 'expense', 'more-horizontal', '#64748b'); -- Slate
