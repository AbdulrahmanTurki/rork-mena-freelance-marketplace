import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react-native';

type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  gigsCount: number;
  tags: string[];
  color: string;
};

export default function CategoriesManagementScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      nameEn: 'Graphic Design',
      nameAr: 'التصميم الجرافيكي',
      icon: '🎨',
      gigsCount: 1234,
      tags: ['Logo', 'Branding', 'UI/UX', 'Illustration', 'Print Design'],
      color: '#ec4899',
    },
    {
      id: '2',
      nameEn: 'Digital Marketing',
      nameAr: 'التسويق الرقمي',
      icon: '📱',
      gigsCount: 856,
      tags: ['SEO', 'Social Media', 'Email Marketing', 'Content Marketing', 'PPC'],
      color: '#3b82f6',
    },
    {
      id: '3',
      nameEn: 'Writing & Translation',
      nameAr: 'الكتابة والترجمة',
      icon: '✍️',
      gigsCount: 623,
      tags: ['Blog Writing', 'Copywriting', 'Translation', 'Proofreading', 'Technical Writing'],
      color: '#10b981',
    },
    {
      id: '4',
      nameEn: 'Video & Animation',
      nameAr: 'الفيديو والأنيميشن',
      icon: '🎬',
      gigsCount: 445,
      tags: ['Video Editing', 'Motion Graphics', '3D Animation', 'Explainer Videos', 'Whiteboard Animation'],
      color: '#f59e0b',
    },
    {
      id: '5',
      nameEn: 'Programming & Tech',
      nameAr: 'البرمجة والتقنية',
      icon: '💻',
      gigsCount: 987,
      tags: ['Web Development', 'Mobile Apps', 'WordPress', 'Game Development', 'APIs'],
      color: '#8b5cf6',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    nameEn: '',
    nameAr: '',
    icon: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  const handleSaveCategory = () => {
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...editingCategory, ...newCategory } : c));
    } else {
      setCategories([...categories, {
        id: Date.now().toString(),
        nameEn: newCategory.nameEn,
        nameAr: newCategory.nameAr,
        icon: newCategory.icon,
        gigsCount: 0,
        tags: newCategory.tags,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
      }]);
    }
    setModalVisible(false);
    setEditingCategory(null);
    setNewCategory({ nameEn: '', nameAr: '', icon: '', tags: [] });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      icon: category.icon,
      tags: category.tags,
    });
    setModalVisible(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(c => c.id !== categoryId));
  };

  const handleAddTag = () => {
    if (newTag.trim() && selectedCategoryId) {
      setCategories(categories.map(c => 
        c.id === selectedCategoryId 
          ? { ...c, tags: [...c.tags, newTag.trim()] }
          : c
      ));
      setNewTag('');
    }
  };

  const handleRemoveTag = (categoryId: string, tag: string) => {
    setCategories(categories.map(c => 
      c.id === categoryId 
        ? { ...c, tags: c.tags.filter(t => t !== tag) }
        : c
    ));
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <View style={[styles.categoryCard, { backgroundColor: theme.card }]}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
          <Text style={styles.iconEmoji}>{category.icon}</Text>
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryTitle, { color: theme.text }]}>
            {isRTL ? category.nameAr : category.nameEn}
          </Text>
          <Text style={[styles.categoryStats, { color: theme.secondaryText }]}>
            {category.gigsCount} {isRTL ? 'خدمة' : 'gigs'} • {category.tags.length} {isRTL ? 'وسوم' : 'tags'}
          </Text>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        {category.tags.map((tag, index) => (
          <View key={index} style={[styles.tag, { backgroundColor: theme.background }]}>
            <Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag(category.id, tag)}>
              <Text style={[styles.removeTag, { color: theme.secondaryText }]}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.addTagButton, { backgroundColor: category.color + '20' }]}
          onPress={() => {
            setSelectedCategoryId(category.id);
            setTagModalVisible(true);
          }}
        >
          <Plus size={14} color={category.color} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
          onPress={() => handleEditCategory(category)}
        >
          <Edit2 size={18} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.primary }]}>
            {isRTL ? 'تعديل' : 'Edit'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ef444420' }]}
          onPress={() => handleDeleteCategory(category.id)}
        >
          <Trash2 size={18} color="#ef4444" />
          <Text style={[styles.actionText, { color: '#ef4444' }]}>
            {isRTL ? 'حذف' : 'Delete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBackground, paddingTop: insets.top + 16 },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isRTL ? 'إدارة التصنيفات والوسوم' : 'Category & Tag Management'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => {
          setEditingCategory(null);
          setNewCategory({ nameEn: '', nameAr: '', icon: '', tags: [] });
          setModalVisible(true);
        }}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingCategory ? (isRTL ? 'تعديل التصنيف' : 'Edit Category') : (isRTL ? 'إضافة تصنيف جديد' : 'Add New Category')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: theme.secondaryText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {isRTL ? 'الاسم بالإنجليزية' : 'English Name'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={newCategory.nameEn}
                  onChangeText={(text) => setNewCategory({ ...newCategory, nameEn: text })}
                  placeholder="Graphic Design"
                  placeholderTextColor={theme.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {isRTL ? 'الاسم بالعربية' : 'Arabic Name'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={newCategory.nameAr}
                  onChangeText={(text) => setNewCategory({ ...newCategory, nameAr: text })}
                  placeholder="التصميم الجرافيكي"
                  placeholderTextColor={theme.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {isRTL ? 'الأيقونة (إيموجي)' : 'Icon (Emoji)'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={newCategory.icon}
                  onChangeText={(text) => setNewCategory({ ...newCategory, icon: text })}
                  placeholder="🎨"
                  placeholderTextColor={theme.secondaryText}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.background }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveCategory}
              >
                <Text style={styles.saveButtonText}>
                  {isRTL ? 'حفظ' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={tagModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setTagModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.tagModalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text, marginBottom: 16 }]}>
              {isRTL ? 'إضافة وسم جديد' : 'Add New Tag'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder={isRTL ? 'اسم الوسم' : 'Tag name'}
              placeholderTextColor={theme.secondaryText}
              autoFocus
            />
            <View style={styles.tagModalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.background }]}
                onPress={() => {
                  setTagModalVisible(false);
                  setNewTag('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  handleAddTag();
                  setTagModalVisible(false);
                }}
              >
                <Text style={styles.saveButtonText}>
                  {isRTL ? 'إضافة' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  categoryStats: {
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
  },
  removeTag: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  addTagButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
  },
  tagModalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  closeButton: {
    fontSize: 24,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  tagModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
