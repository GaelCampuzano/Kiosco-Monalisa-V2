-- Migration to add idempotency_key column to tips table
-- This column ensures we don't insert duplicate tips when network is unstable.

ALTER TABLE tips 
ADD COLUMN idempotency_key VARCHAR(36) UNIQUE;

-- Add an index for faster lookups if needed (though UNIQUE implies an index in MySQL)
-- CREATE INDEX idx_tips_idempotency ON tips(idempotency_key);
