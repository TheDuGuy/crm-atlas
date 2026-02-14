-- Seed data for CRM Atlas

-- Insert sample products
INSERT INTO products (name, description) VALUES
  ('Payment Links', 'Payment Links product area'),
  ('TIC', 'Terminal Instant Checkout'),
  ('TIC/PBB', 'Terminal Instant Checkout / Pay by Bank'),
  ('Tools/Boosts', 'Merchant tools and boosts');

-- Example: Get product IDs for reference
DO $$
DECLARE
  payment_links_id UUID;
  tic_id UUID;
  tools_boosts_id UUID;
BEGIN
  SELECT id INTO payment_links_id FROM products WHERE name = 'Payment Links';
  SELECT id INTO tic_id FROM products WHERE name = 'TIC';
  SELECT id INTO tools_boosts_id FROM products WHERE name = 'Tools/Boosts';

  -- Insert sample fields
  INSERT INTO fields (product_id, name, description, format, live) VALUES
    (payment_links_id, 'TapToPayInstallationSuccessful', 'Has a member been enabled in LD for T2P', 'EVENT', true),
    (payment_links_id, 'TapToPay.ttpLatestTransactionDate', 'The date of the most recent T2P transaction, regardless of its status', 'MM/DD/YY', true);

  -- Insert sample events
  INSERT INTO events (product_id, name, description) VALUES
    (payment_links_id, 'payment_link_created', 'User creates a new payment link'),
    (tic_id, 'tic_checkout_started', 'Terminal checkout session initiated');

  -- Insert sample flows
  INSERT INTO flows (product_id, name, purpose, description, trigger_type, frequency, channels, live, sto, iterable_id) VALUES
    (payment_links_id, 'Share Payment Details', 'activation', 'Sent to members who have created a PIL in the past but not in the last 30 days', 'scheduled', 'Every 30 days', ARRAY['email']::channel_type[], true, false, '12345'),
    (tools_boosts_id, 'Next Day Settlement Acquisition', 'activation', 'An acquisition flow encouraging Payment Links users to subscribe to Next Day Settlement', 'event_based', 'Daily', ARRAY['email']::channel_type[], true, true, '78901');

  -- Insert sample opportunity
  INSERT INTO opportunities (product_id, title, description, impact, effort, confidence, status) VALUES
    (payment_links_id, 'Add payment link usage tracking', 'Track when payment links are actually used by customers', 4, 2, 5, 'idea');
END $$;
