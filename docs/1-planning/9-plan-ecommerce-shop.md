# E-commerce Shop

## Overview
Add merchandise sales capability to generate additional revenue. Evaluates Shopify integration (quick MVP) vs full AWS-native solution (long-term). Start with print-on-demand to test demand.

**Status:** 📋 Planned  
**Priority:** Low (future revenue stream)  
**Dependencies:** None (independent of blog/social systems)

## Prerequisites
- Website fully functional with donation system
- Market demand validated (could use PWA analytics)

## Checklist
- [ ] Step 1: Print-on-Demand MVP
- [ ] Step 2: Shopify Integration
- [ ] Step 3: AWS-Native Migration (Future)

---

## Step 1: Print-on-Demand MVP

Test market demand with zero inventory risk:
- **Printful/Printify:** No inventory, automatic fulfillment
- **Teespring/Spring:** Built-in storefront options
- **Gooten:** Good for custom designs

**Product mix:** T-shirts, hoodies with mission messaging, tote bags, water bottles, stickers, pins, educational materials.

**Revenue model:** Higher margins than typical retail (supporters expect premium). Bundle with donation options ("Round up for impact"). Limited edition items for campaigns.

## Step 2: Shopify Integration

**Why Shopify for MVP:**
- Nonprofit-friendly pricing
- Easy React integration via Shopify Buy SDK
- Handles payments, inventory, shipping automatically
- Professional checkout experience
- Built-in analytics and reporting

**Implementation:**
- Separate `/shop` section maintaining consistent branding
- Integrate with current donation system
- Shopify Buy SDK in React frontend

## Step 3: AWS-Native Migration (Future)

Full AWS e-commerce solution following Amazon's architecture model:

**Core Services:**
- S3 + CloudFront: Product images, static assets
- API Gateway + Lambda: Cart, checkout, orders
- DynamoDB: Products, inventory, orders, customers
- Cognito: User authentication
- SES: Order confirmations, shipping notifications

**Payment:** Lambda functions for Stripe/PayPal webhooks, Secrets Manager for API keys, Step Functions for order workflows.

**Advanced:** Elasticsearch (search/filtering), SNS/SQS (order queues), Personalize (recommendations).

**Benefits:** Single vendor, integrated security, auto-scaling, cost-effective, complete data control.

---

## Platform Comparison

| Option | Monthly Cost | App Store Fees | Dev Time |
|--------|-------------|----------------|----------|
| Print-on-Demand | $0 | $0 | 1-2 hours |
| Shopify | ~$30 | $0 | 1-2 weeks |
| AWS-Native | $10-40 | $0 | 6-8 weeks |

## Timeline

- **Phase 1 (now):** Focus on current website completion
- **Phase 2 (6-12 months):** Test demand with print-on-demand + Shopify
- **Phase 3 (1-2 years):** Evaluate AWS migration based on growth

---

*Last updated: November 15, 2025*
