#!/bin/bash

# Update Stripe Secret Key for staging environment using SAM
# Usage: ./update-stripe-key.sh sk_test_your_actual_stripe_key

if [ -z "$1" ]; then
    echo "Usage: $0 <stripe_secret_key>"
    echo "Example: $0 sk_test_51ABC123..."
    exit 1
fi

STRIPE_KEY="$1"

echo "Updating fartooyoung-staging stack with new Stripe key..."

cd backend && sam deploy \
    --config-env staging \
    --parameter-overrides StripeSecretKey="$STRIPE_KEY" \
    --no-confirm-changeset

echo "Stack update completed."
