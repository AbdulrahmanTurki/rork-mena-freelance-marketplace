-- Make order_id nullable to support pre-order inquiries
ALTER TABLE messages 
ALTER COLUMN order_id DROP NOT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver 
ON messages(sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender 
ON messages(receiver_id, sender_id);

-- Add a check constraint to ensure either order_id exists OR both sender_id and receiver_id exist
ALTER TABLE messages 
ADD CONSTRAINT messages_order_or_users_check 
CHECK (
  order_id IS NOT NULL OR 
  (sender_id IS NOT NULL AND receiver_id IS NOT NULL)
);
