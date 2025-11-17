# Far Too Young - Child Marriage Prevention Organization

A responsive React application built with Vite and Tailwind CSS for an organization focused on ending child marriage globally.

## Features

- **Responsive Design**: Mobile-first approach with dark theme
- **4 Core Pages**: Child Marriage, Founder & Team, Partners, What We Do
- **Authentication Modal**: Sign up/Login functionality
- **Donation System**: One-time and recurring donation options with Stripe/PayPal integration mockups
- **Modern UI**: Clean, professional design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom dark theme

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Testing

See `test-credentials.md` for login credentials and testing instructions.

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation with auth/donate buttons
│   ├── AuthModal.jsx       # Login/signup modal
│   └── DonationModal.jsx   # Donation processing modal
├── pages/
│   ├── ChildMarriage.jsx   # Main landing page
│   ├── FounderTeam.jsx     # Team information
│   ├── Partners.jsx        # Partner organizations
│   └── WhatWeDo.jsx        # Programs and impact
├── App.jsx                 # Main app component with routing
├── main.jsx               # React entry point
└── index.css              # Tailwind imports and global styles
```

## AWS Architecture (Future Deployment)

### Serverless Architecture Components

1. **CloudFront Distribution**
   - Global CDN for static asset delivery
   - SSL/TLS termination
   - Caching strategy for optimal performance

2. **Lambda Functions**
   - Authentication API endpoints
   - Donation processing logic
   - Data validation and business logic
   - Integration with payment gateways

3. **DynamoDB Tables**
   ```
   Users Table:
   - PK: userId
   - email, name, createdAt, lastLogin
   
   Donations Table:
   - PK: donationId
   - userId, amount, type (one-time/recurring), paymentMethod
   - status, createdAt, processedAt
   
   Transactions Table:
   - PK: transactionId
   - donationId, stripePaymentId, status, amount
   - createdAt, completedAt
   ```

4. **Route 53**
   - Domain management
   - DNS routing
   - Health checks

5. **AWS Secrets Manager**
   - Stripe API keys
   - PayPal credentials
   - JWT signing secrets
   - Database connection strings

### Data Strategy

**Primary Focus**: Donor and transaction data capture for reporting and analysis

**Key Metrics to Track**:
- Donor acquisition and retention
- Donation patterns and trends
- Geographic distribution of supporters
- Campaign effectiveness
- Payment method preferences

**Future E-commerce Considerations** (5+ years):
- Product catalog structure
- Inventory management
- Order processing workflows
- Customer relationship management

### Security Considerations

- All API keys stored in AWS Secrets Manager
- Lambda functions with minimal IAM permissions
- DynamoDB encryption at rest
- CloudFront with WAF protection
- HTTPS enforcement across all endpoints

### Deployment Strategy

1. **Static Assets**: Deploy to S3, serve via CloudFront
2. **API Layer**: Lambda functions with API Gateway
3. **Database**: DynamoDB with backup and point-in-time recovery
4. **Monitoring**: CloudWatch for logs and metrics
5. **CI/CD**: AWS CodePipeline for automated deployments

## Payment Integration

### Stripe Integration (Mock)
- One-time payments
- Recurring subscriptions
- Webhook handling for payment confirmations
- Customer portal for subscription management

### PayPal Integration (Mock)
- PayPal Checkout experience
- Subscription billing
- IPN (Instant Payment Notification) handling

## Development Notes

- Components are functional with React hooks
- Responsive design tested on mobile, tablet, and desktop
- Dark theme optimized for accessibility
- Form validation and error handling included
- Mock payment processing for development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
