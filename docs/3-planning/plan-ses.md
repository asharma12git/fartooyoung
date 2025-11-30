# SES Email Implementation Plan

## Current Status: ✅ IMPLEMENTED - Awaiting AWS SES Approval

**Issue:** SES account under enforcement shutdown due to WordPress bot attack (15.01% bounce rate)
**Status:** Support case submitted, WordPress disconnected from SES, awaiting approval
**ETA:** 24-48 hours for AWS Support response

---

## ✅ COMPLETED IMPLEMENTATION

### Database Updates - DONE
```sql
-- Already implemented in DynamoDB
email_verified: BOOLEAN (default: false)
verification_token: STRING
verification_expires: NUMBER (timestamp)
role: STRING (default: 'donor')
```

### Dependencies Installed - DONE
```bash
@aws-sdk/client-ses
crypto
```

### SAM Template Updated - DONE
```yaml
# SES permissions added to all auth functions
SES_FROM_EMAIL: admin@fartooyoung.org
SES_REGION: us-east-1
```

### Lambda Functions Created - DONE
**Location:** `/backend/lambda/auth/`

1. **register.js** - ✅ Implemented
   - Creates user with email_verified = false
   - Generates verification token
   - Sends verification email via SES
   - Returns success message

2. **verify-email.js** - ✅ Implemented
   - Validates verification token
   - Updates email_verified = true
   - Removes verification token
   - Handles expired tokens

3. **resend-verification.js** - ✅ Implemented
   - Generates new verification token
   - Sends new verification email
   - Rate limiting protection

4. **handle-bounces.js** - ✅ Created (Ready for deployment)
   - Processes SES bounce notifications
   - Auto-suppresses bounced email addresses
   - Handles complaints

### Email Service Utility - DONE
**Location:** `/backend/utils/emailService.js`
- sendEmail() function
- sendVerificationEmail() with HTML template
- sendPasswordResetEmail() function
- generateVerificationToken() function

### Frontend Components - DONE
1. **AuthModal.jsx** - ✅ Updated
   - Registration form disables after success
   - Shows verification message
   - Prevents duplicate submissions

2. **VerifyEmail.jsx** - ✅ Created
   - Auto-verifies token from URL
   - Shows loading/success/error states
   - Auto-redirects to login after verification

3. **App.jsx** - ✅ Updated
   - Added `/verify-email` route
   - Integrated with auth flow

---

## 🚀 NEXT STEPS - When AWS Approves SES

### Immediate Testing (Day 1)
1. **Verify SES Status**
   ```bash
   aws sesv2 get-account --region us-east-1
   # Check: EnforcementStatus should be "ACTIVE"
   ```

2. **Test Email Verification Flow**
   - Register new user with real email
   - Check email delivery
   - Click verification link
   - Confirm login works

3. **Test SES Mailbox Simulator**
   ```javascript
   // Test addresses that don't affect reputation
   success@simulator.amazonses.com  // Successful delivery
   bounce@simulator.amazonses.com   // Generates bounce
   complaint@simulator.amazonses.com // Generates complaint
   ```

### Monitoring Setup (Day 1-2)
4. **Enable SES Event Publishing**
   - Set up CloudWatch metrics
   - Configure SNS for bounce/complaint notifications
   - Deploy handle-bounces.js Lambda

5. **Set Up Alerts**
   ```bash
   # CloudWatch alarms for:
   # - Bounce rate > 5%
   # - Complaint rate > 0.1%
   # - Daily send volume
   ```

### Production Deployment (Day 2-3)
6. **Deploy Bounce Handler**
   ```yaml
   # Add to template.yaml
   HandleBouncesFunction:
     Type: AWS::Serverless::Function
     Properties:
       Handler: lambda/auth/handle-bounces.handler
       Events:
         SESBounce:
           Type: SNS
           Properties:
             Topic: !Ref SESNotificationTopic
   ```

7. **Update Frontend Environment**
   ```bash
   # Update .env files
   VITE_API_BASE_URL=https://your-api-gateway-url
   ```

### Testing Checklist
- [ ] Registration → Email sent → Verification → Login
- [ ] Password reset flow
- [ ] Bounce handling (using simulator)
- [ ] Rate limiting on registration
- [ ] Email template rendering
- [ ] Mobile email display
- [ ] Spam folder testing

### Monitoring Dashboard
8. **Create SES Monitoring**
   - Bounce rate tracking
   - Complaint rate tracking
   - Daily send volume
   - Suppression list growth

### Security Hardening
9. **Final Security Review**
   - Rate limiting on all email endpoints
   - Input validation and sanitization
   - Token expiration handling
   - CAPTCHA on registration forms

---

## 📊 Expected Metrics (Post-Approval)

### Target Metrics
- **Bounce Rate:** <2% (AWS threshold: <5%)
- **Complaint Rate:** <0.1% (AWS threshold: <0.1%)
- **Daily Volume:** 10-50 emails/day initially
- **Delivery Rate:** >98%

### Cost Projection
- **Current:** $0 (within free tier)
- **Expected:** $0-2/month for nonprofit volume

---

## 🔧 Troubleshooting Guide

### If Emails Don't Send
1. Check SES account status
2. Verify domain/email identity
3. Check Lambda logs in CloudWatch
4. Verify environment variables

### If High Bounce Rate
1. Check email validation logic
2. Review user registration sources
3. Enable suppression list
4. Implement double opt-in

### If Delivery Issues
1. Check spam folder placement
2. Review email content/templates
3. Verify SPF/DKIM records
4. Monitor reputation metrics

---

## 📝 Documentation Links
- [AWS SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
- [SES Bounce Handling](https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html)
- [Email Authentication](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication.html)

---

**Ready for immediate deployment once AWS approves SES account restoration.**
