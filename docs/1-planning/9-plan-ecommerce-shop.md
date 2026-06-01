# E-commerce Shop

## Overview
Add merchandise sales capability to generate additional revenue. Evaluates Shopify integration (quick MVP) vs full AWS-native solution (long-term). Start with print-on-demand to test demand.

## Prerequisites
- Website fully functional with donation system
- Market demand validated (could use PWA analytics)

## Cost

| Option | Monthly Cost |
|--------|-------------|
| Print-on-Demand | $0 |
| Shopify | ~$30 |
| AWS-Native | $10-40 |

## Checklist
- [ ] Step 1: Print-on-Demand MVP
- [ ] Step 2: Shopify Integration
- [ ] Step 3: AWS-Native Migration (Future)

---

## Step 1: Print-on-Demand MVP ⬜

**Benefit:** Print-on-demand services (Printful, Printify, Gooten) handle manufacturing, inventory, and shipping automatically — you upload designs, they print and ship when someone orders. Zero upfront cost, zero inventory risk.

**Problem:** Without merchandise, we miss a revenue stream that also doubles as awareness marketing (people wearing/using branded items spread the mission).

**Implementation:**

Platforms to evaluate:
- **Printful/Printify:** No inventory, automatic fulfillment
- **Teespring/Spring:** Built-in storefront options
- **Gooten:** Good for custom designs

Product mix: T-shirts, hoodies with mission messaging, tote bags, water bottles, stickers, pins, educational materials.

Revenue model: Higher margins than typical retail (supporters expect premium). Bundle with donation options ("Round up for impact"). Limited edition items for campaigns.

## Step 2: Shopify Integration ⬜

**Benefit:** Shopify is an e-commerce platform that handles payments, inventory, shipping, and checkout out of the box. The Shopify Buy SDK allows embedding a Shopify-powered store inside our existing React app without redirecting users.

**Problem:** Building e-commerce from scratch (cart, checkout, inventory, shipping) would take 6-8 weeks. Shopify provides all of this immediately with nonprofit-friendly pricing.

**Implementation:**
- Separate `/shop` section maintaining consistent branding
- Integrate with current donation system
- Shopify Buy SDK in React frontend
- Handles payments, inventory, shipping automatically
- Professional checkout experience
- Built-in analytics and reporting

## Step 3: AWS-Native Migration (Future) ⬜

**Benefit:** A fully AWS-native e-commerce solution gives complete data control, eliminates third-party fees, integrates seamlessly with existing infrastructure, and scales automatically.

**Problem:** Shopify charges monthly fees and takes a cut of transactions. At scale, an AWS-native solution is more cost-effective and gives full control over the customer experience.

**Implementation:**

Core Services:
- S3 + CloudFront: Product images, static assets
- API Gateway + Lambda: Cart, checkout, orders
- DynamoDB: Products, inventory, orders, customers
- Cognito: User authentication
- SES: Order confirmations, shipping notifications

Payment: Lambda functions for Stripe/PayPal webhooks, Secrets Manager for API keys, Step Functions for order workflows.

Advanced: Elasticsearch (search/filtering), SNS/SQS (order queues), Personalize (recommendations).

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
