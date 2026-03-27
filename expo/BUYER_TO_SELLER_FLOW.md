# Buyer to Seller Flow

## Overview
Buyers can become sellers after going through an onboarding and verification process that requires admin approval.

## User Flow

### 1. **Buyer Clicks "Switch to Selling"**
Location: Profile page (`app/(tabs)/profile.tsx`)
- Button displays "Switch to Selling" for buyers
- Button displays "Seller Dashboard" for existing sellers with status info

### 2. **System Checks Verification Status**
The system checks if the user has an existing seller verification:

#### A. **No Verification Record (First Time)**
- Shows alert explaining the verification process
- Offers two options:
  - Cancel
  - Start Verification → redirects to onboarding page

#### B. **Has Verification Record**
System checks the verification status:

**Status: Pending**
- Updates user_type to "seller" in profiles table
- Redirects to `/seller/verification-pending`
- Shows waiting message with admin review timeline

**Status: Approved**
- Updates user_type to "seller" in profiles table
- Redirects to `/seller/(tabs)/dashboard`
- Full access to seller features

**Status: Rejected**
- Shows alert about rejection
- Suggests contacting support or submitting new application
- Does NOT update user_type

### 3. **Verification Onboarding Process**
Location: `/seller/verification-onboarding`

**Step 1: Identity Information**
- Full name (Arabic & English)
- National ID/Iqama number
- Date of birth
- Nationality
- Gender (optional)
- Mobile number with OTP verification
- Email
- City of residence

**Step 2: Identity Documents**
- Upload ID/Iqama front photo
- Upload ID/Iqama back photo
- Must be clear and readable

**Step 3: Freelance Permit**
- Freelance permit number
- Permit expiration date
- Upload permit document
- Must be valid Saudi Freelance Document (وثيقة العمل الحر)

**Step 4: Review & Submit**
- Review all entered information
- Submit for admin review
- Creates record in `seller_verifications` table with status "pending"

### 4. **Admin Approval**
Location: Admin panel (`/admin/(tabs)/users` or `/admin/verifications`)

Admin can:
- View all pending verifications
- Review submitted documents
- Approve or reject applications
- Add rejection reason if needed

### 5. **Post-Approval**
Once approved:
- User can access full seller dashboard
- Can create and manage gigs
- Can view orders and earnings
- Can manage seller settings

## Database Tables

### `profiles`
- `user_type`: 'buyer' | 'seller'
- Other user information

### `seller_verifications`
- `user_id`: FK to profiles
- `status`: 'pending' | 'approved' | 'rejected'
- `permit_number`: Freelance permit number
- `permit_expiration_date`: Permit expiry
- `id_front_url`: ID front photo URL
- `id_back_url`: ID back photo URL
- `permit_document_url`: Permit document URL
- `rejection_reason`: Reason if rejected
- Timestamps

## Key Features

### Protection Mechanisms
1. **Rate Limiting**: Prevents spam signups
2. **Document Validation**: All documents must be uploaded
3. **Admin Approval**: Manual review prevents fraud
4. **Status Tracking**: Clear status at every step

### User Experience
1. **Clear Communication**: Alerts explain each step
2. **Status Visibility**: Users always know their verification status
3. **Progress Tracking**: 4-step progress bar in onboarding
4. **Flexible Re-entry**: Users can return to buyer mode if needed

### Error Handling
1. Rate limit errors show wait time
2. Upload failures are caught and reported
3. Database errors don't leave user in bad state
4. Clear error messages guide user to resolution

## Testing the Flow

### As a Buyer
1. Create buyer account via onboarding
2. Go to Profile tab
3. Click "Switch to Selling"
4. Complete verification process
5. Wait for admin approval

### As Admin
1. Login to admin panel
2. Navigate to Users or Verifications
3. Review pending verification
4. Approve or reject with reason

## Notes
- Users must have valid Saudi Freelance Permit
- Documents are stored in Supabase Storage
- OTP verification is simulated (would need real SMS provider)
- Email verification uses the email from auth
