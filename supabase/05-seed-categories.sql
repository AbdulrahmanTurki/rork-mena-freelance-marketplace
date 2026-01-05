-- =============================================================================
-- SEED CATEGORIES
-- Run this optionally to add default categories
-- =============================================================================

-- Delete existing categories (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE categories CASCADE;

-- Insert categories
INSERT INTO categories (name, name_ar, slug, icon, description) VALUES
  ('Graphic Design', 'التصميم الجرافيكي', 'graphic-design', '🎨', 'Logo design, branding, and visual content'),
  ('Digital Marketing', 'التسويق الرقمي', 'digital-marketing', '📱', 'SEO, social media, and online advertising'),
  ('Writing & Translation', 'الكتابة والترجمة', 'writing-translation', '✍️', 'Content writing, copywriting, and translation services'),
  ('Video & Animation', 'الفيديو والرسوم المتحركة', 'video-animation', '🎬', 'Video editing, animation, and motion graphics'),
  ('Music & Audio', 'الموسيقى والصوت', 'music-audio', '🎵', 'Voice over, audio editing, and music production'),
  ('Programming & Tech', 'البرمجة والتقنية', 'programming-tech', '💻', 'Web development, mobile apps, and technical solutions'),
  ('Business', 'الأعمال', 'business', '💼', 'Business consulting, financial planning, and strategy'),
  ('Lifestyle', 'أسلوب الحياة', 'lifestyle', '🌟', 'Personal coaching, fitness, and lifestyle services')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM categories;
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✓ CATEGORIES SEEDED';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Total categories: %', category_count;
  RAISE NOTICE '====================================================';
END $$;
