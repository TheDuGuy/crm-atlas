-- Make product_id nullable in missing_signals table
-- Some signals are cross-product and don't belong to a single product

ALTER TABLE missing_signals
ALTER COLUMN product_id DROP NOT NULL;
