-- Insert default categories for the freelance marketplace

INSERT INTO categories (id, name, name_ar, slug, icon, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Graphic Design', 'التصميم الجرافيكي', 'graphic-design', 'Palette', 'Logo design, branding, and visual identity'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Web Development', 'تطوير الويب', 'web-development', 'Code', 'Website development and programming'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mobile Apps', 'تطبيقات الجوال', 'mobile-apps', 'Smartphone', 'iOS and Android app development'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Writing & Translation', 'الكتابة والترجمة', 'writing-translation', 'FileText', 'Content writing, copywriting, and translation services'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Video & Animation', 'الفيديو والرسوم المتحركة', 'video-animation', 'Video', 'Video editing, motion graphics, and animation'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Digital Marketing', 'التسويق الرقمي', 'digital-marketing', 'TrendingUp', 'SEO, social media, and digital advertising'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Music & Audio', 'الموسيقى والصوتيات', 'music-audio', 'Music', 'Audio production, voice-overs, and sound design'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Business Consulting', 'الاستشارات التجارية', 'business-consulting', 'Briefcase', 'Business plans, market research, and consulting'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Data & Analytics', 'البيانات والتحليلات', 'data-analytics', 'BarChart', 'Data analysis, visualization, and reporting'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Photography', 'التصوير الفوتوغرافي', 'photography', 'Camera', 'Professional photography and photo editing')
ON CONFLICT (id) DO NOTHING;
