# Supabase Integration Guide

This app now has a fully integrated Supabase backend with React Query for state management.

## 📦 Available Hooks

All hooks are located in the `/hooks` directory and use React Query for caching, loading states, and automatic refetching.

### 1. Categories (`hooks/useCategories.ts`)

```typescript
import { useCategories, useCategory, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';

// Fetch all categories
const { data: categories, isLoading, error } = useCategories();

// Fetch single category
const { data: category } = useCategory(categoryId);

// Create category (admin only)
const createCategory = useCreateCategory();
createCategory.mutate({
  name: "Web Development",
  name_ar: "تطوير الويب",
  slug: "web-development",
  description: "Professional web development services"
});

// Update category
const updateCategory = useUpdateCategory();
updateCategory.mutate({
  id: categoryId,
  updates: { name: "Updated Name" }
});

// Delete category
const deleteCategory = useDeleteCategory();
deleteCategory.mutate(categoryId);
```

### 2. Gigs (`hooks/useGigs.ts`)

```typescript
import { useGigs, useGig, useSearchGigs, useCreateGig, useUpdateGig, useDeleteGig } from '@/hooks/useGigs';

// Fetch all gigs (with optional filters)
const { data: gigs, isLoading } = useGigs({
  categoryId: "category-uuid", // optional
  sellerId: "seller-uuid", // optional
  featured: true, // optional
  limit: 10 // optional
});

// Fetch single gig with details
const { data: gig } = useGig(gigId);

// Search gigs
const { data: searchResults } = useSearchGigs("web development");

// Create gig
const createGig = useCreateGig();
createGig.mutate({
  seller_id: userId,
  category_id: categoryId,
  title: "I will create a modern website",
  description: "...",
  price: 500,
  delivery_time: 7,
  images: ["url1", "url2"],
  tags: ["web", "design"],
  revisions_included: 2
});

// Update gig
const updateGig = useUpdateGig();
updateGig.mutate({
  id: gigId,
  updates: { price: 600, is_active: true }
});

// Delete gig
const deleteGig = useDeleteGig();
deleteGig.mutate(gigId);
```

### 3. Orders (`hooks/useOrders.ts`)

```typescript
import { 
  useOrders, 
  useOrder, 
  useCreateOrder, 
  useUpdateOrder, 
  useRequestRevision,
  useDeliverOrder,
  useCompleteOrder 
} from '@/hooks/useOrders';

// Fetch orders
const { data: orders } = useOrders({
  buyerId: userId, // optional
  sellerId: userId, // optional
  status: "in_progress" // optional
});

// Fetch single order
const { data: order } = useOrder(orderId);

// Create order
const createOrder = useCreateOrder();
createOrder.mutate({
  order_number: "ORD-" + Date.now(),
  buyer_id: buyerId,
  seller_id: sellerId,
  gig_id: gigId,
  gig_title: "Logo Design",
  gig_price: 300,
  escrow_amount: 300,
  platform_fee: 30,
  seller_net_amount: 270,
  revisions_allowed: 2
});

// Request revision
const requestRevision = useRequestRevision();
requestRevision.mutate({
  orderId: orderId,
  requestMessage: "Please change the colors",
  revisionNumber: 1
});

// Deliver order
const deliverOrder = useDeliverOrder();
deliverOrder.mutate({
  orderId: orderId,
  deliveryFiles: ["file1.zip", "file2.pdf"]
});

// Complete order
const completeOrder = useCompleteOrder();
completeOrder.mutate(orderId);
```

### 4. Messages (`hooks/useMessages.ts`)

```typescript
import { 
  useMessages, 
  useConversations, 
  useSendMessage, 
  useMarkMessageAsRead,
  useMarkAllMessagesAsRead 
} from '@/hooks/useMessages';

// Fetch messages for an order (with real-time updates)
const { data: messages } = useMessages(orderId);

// Fetch all conversations
const { data: conversations } = useConversations();

// Send message
const sendMessage = useSendMessage();
sendMessage.mutate({
  order_id: orderId,
  sender_id: userId,
  receiver_id: otherUserId,
  message: "Hello!",
  attachments: []
});

// Mark message as read
const markAsRead = useMarkMessageAsRead();
markAsRead.mutate(messageId);

// Mark all messages as read
const markAllAsRead = useMarkAllMessagesAsRead();
markAllAsRead.mutate(orderId);
```

### 5. Wallet (`hooks/useWallet.ts`)

```typescript
import { 
  useSellerWallet, 
  useWithdrawalRequests, 
  useTransactions,
  useCreateWithdrawalRequest,
  useUpdateWallet,
  useProcessWithdrawal 
} from '@/hooks/useWallet';

// Fetch seller wallet
const { data: wallet } = useSellerWallet(sellerId);

// Fetch withdrawal requests
const { data: withdrawals } = useWithdrawalRequests(sellerId);

// Fetch transactions
const { data: transactions } = useTransactions(userId);

// Create withdrawal request
const createWithdrawal = useCreateWithdrawalRequest();
createWithdrawal.mutate({
  amount: 1000,
  payoutMethod: "bank_transfer",
  payoutDetails: { bankAccount: "..." }
});

// Process withdrawal (admin)
const processWithdrawal = useProcessWithdrawal();
processWithdrawal.mutate({
  withdrawalId: withdrawalId,
  status: "approved"
});
```

### 6. Profiles (`hooks/useProfiles.ts`)

```typescript
import { useProfile, useProfiles, useTopSellers, useUpdateProfile } from '@/hooks/useProfiles';

// Fetch single profile
const { data: profile } = useProfile(userId);

// Fetch profiles with filters
const { data: profiles } = useProfiles({
  userType: "seller", // optional
  verified: true // optional
});

// Fetch top sellers
const { data: topSellers } = useTopSellers(10);

// Update profile
const updateProfile = useUpdateProfile();
updateProfile.mutate({
  userId: userId,
  updates: { full_name: "New Name", city: "Riyadh" }
});
```

## 🎯 Common Patterns

### Loading States
```typescript
const { data, isLoading, error } = useGigs();

if (isLoading) return <ActivityIndicator />;
if (error) return <Text>Error: {error.message}</Text>;

return <View>{/* Render data */}</View>;
```

### Mutations with Callbacks
```typescript
const createGig = useCreateGig();

const handleSubmit = async () => {
  try {
    await createGig.mutateAsync({
      // gig data
    });
    Alert.alert("Success", "Gig created!");
    router.back();
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

// Or use onSuccess/onError
createGig.mutate(gigData, {
  onSuccess: () => Alert.alert("Success!"),
  onError: (error) => Alert.alert("Error", error.message)
});
```

### Conditional Queries
```typescript
// Only fetch when user is authenticated
const { data } = useOrders();  // automatically disabled if no user in context

// Only fetch when ID exists
const { data } = useGig(gigId);  // enabled: !!gigId
```

### Real-time Updates
Messages automatically subscribe to real-time updates when you use `useMessages(orderId)`. The hook handles subscription cleanup automatically.

## 🔒 Row Level Security

All tables have RLS policies enabled. Users can only access their own data. The policies are defined in `supabase/schema.sql`.

## 📝 Type Safety

All hooks use TypeScript types from `types/database.types.ts` which are generated from your Supabase schema.

## 🚀 Best Practices

1. **Use hooks at component level**, not in event handlers
2. **Leverage React Query caching** - data is automatically cached and shared
3. **Check mutation states** - use `isPending`, `isError`, `isSuccess` from mutations
4. **Handle errors gracefully** - always show user-friendly error messages
5. **Invalidate queries** - mutations automatically invalidate related queries
6. **Use optimistic updates** for better UX (advanced pattern)

## 🔄 Cache Invalidation

Mutations automatically invalidate related queries:
- Creating/updating/deleting gigs → invalidates gig queries
- Sending messages → invalidates message and conversation queries
- Creating orders → invalidates order queries
- Etc.

## 📱 Example Component

```typescript
import { useGigs } from '@/hooks/useGigs';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';

export default function GigListScreen() {
  const { data: gigs, isLoading, error, refetch } = useGigs({ limit: 20 });

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <FlatList
      data={gigs}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
          <Text>{item.price} SAR</Text>
        </View>
      )}
      keyExtractor={item => item.id}
      onRefresh={refetch}
      refreshing={isLoading}
    />
  );
}
```

## 🎨 Integration with Mock Data

If you want to seed your database with mock data:

1. Go to Supabase SQL Editor
2. Run the INSERT queries from `/mocks/data.ts` (you'll need to convert the data format)
3. Or use the admin panel to create sample data

## 🔍 Debugging

- Check console logs - all hooks log their operations
- Use React Query Devtools (installed but needs to be added to UI)
- Check Supabase dashboard for query logs
- Verify RLS policies if you get permission errors

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Database Schema](supabase/schema.sql)
- [Type Definitions](types/database.types.ts)
