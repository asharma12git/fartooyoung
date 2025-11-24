# Context Restart Prompt for Next Session

## Current Project Status (Nov 24, 2025)

**Far Too Young Donation Platform** - Complete full-stack application with AWS backend integration

### ✅ **What's Working (Phase 17 Complete)**
- **Live AWS API**: https://f20mzr7xcg.execute-api.us-east-1.amazonaws.com/Prod/
- **Professional Registration**: First Name | Last Name fields with clean database structure
- **Frontend-AWS Integration**: React app connects to live AWS backend with CORS
- **Login Persistence**: Users stay logged in after refresh (localStorage management)
- **Case-Insensitive Emails**: sam.smith@fty.com = Sam.Smith@fty.com throughout system
- **All Endpoints Working**: Registration, login, logout, donations, dashboard
- **Backward Compatibility**: Supports old users (name field) and new users (firstName/lastName)

### 🎯 **Next Priority: Donation Auto-Linking + Account Deletion**

**Problem 1 - Orphaned Donations**: 
- Anonymous user donates with john@example.com
- Later registers with john@example.com
- Dashboard shows empty (donations exist but aren't linked to account)

**Problem 2 - No Account Deletion**: 
- Users have no way to delete their accounts
- Need GDPR-compliant deletion that preserves donation impact data

**Solutions for Tomorrow**: 

**1. Donation Auto-Linking (30-45 mins)**
- Update registration function to find existing donations by email
- Auto-associate orphaned donations with new user accounts
- Improve user experience for donation history

**2. Account Deletion with Donation Preservation (30-40 mins)**
- Add "Delete Account" feature in Settings tab
- Remove user personal data (email, firstName, lastName, password)
- Anonymize donations (keep amounts/dates, remove personal info)
- Preserve platform impact metrics (total donations, girls educated)

### 📁 **Key Files to Work With**
- `/backend/lambda/auth/register.js` - Add donation linking logic
- `/backend/lambda/auth/delete-account.js` - New endpoint for account deletion
- `/backend/lambda/donations/get-donations.js` - Verify linking works
- `/src/pages/DonorDashboard.jsx` - Add "Delete Account" button in Settings
- Test flows: anonymous donation → registration → dashboard → account deletion

### 🎯 **Account Deletion Strategy**

**What Gets Deleted:**
- ✅ User account (email, firstName, lastName, password)
- ✅ Personal information from donations (name field)
- ✅ JWT tokens invalidated

**What Gets Preserved:**
- ✅ Donation amounts and dates (for platform statistics)
- ✅ Impact metrics (girls educated, lives changed)
- ✅ Anonymized donation records (`email: "deleted-user", name: "Anonymous Donor"`)

**User Experience:**
```
"Delete Account" → Confirmation Modal:
"Your account will be deleted, but your $150 in donations 
that helped educate 3 girls will remain to show your impact 
on our platform statistics."
```

### 🚀 **Current Infrastructure**
- **AWS Stack**: fartooyoung-staging (9 Lambda functions, 2 DynamoDB tables)
- **Frontend**: React app with AWS API integration (port 4173 for production testing)
- **Database**: Clean firstName/lastName structure with email normalization
- **Testing**: Full curl command suite available in docs/5-testing/

### 💡 **Development Environment**
```bash
# Frontend (production build with AWS API)
cd /Users/avinashsharma/WebstormProjects/fartooyoung
npm run build && npm run preview  # Port 4173

# Backend (AWS deployment)
cd /Users/avinashsharma/WebstormProjects/fartooyoung/backend
sam build && sam deploy --stack-name fartooyoung-staging --s3-bucket fartooyoung-backend-staging --capabilities CAPABILITY_IAM --region us-east-1 --parameter-overrides "Environment=staging JWTSecret=FTY-Staging-JWT-Secure-Key DynamoDBEndpoint=''"
```

### 🎯 **Session Goals**
1. **Donation Auto-Linking**: Users who donate anonymously and then register see their donation history in the dashboard
2. **Account Deletion**: GDPR-compliant account deletion that preserves donation impact data for platform statistics
3. **Complete User Lifecycle**: Anonymous donation → Registration → Dashboard → Account deletion (optional)

**Total Estimated Time**: 1-1.5 hours for both features

---

**Ready to continue building! The foundation is solid - now let's complete the user experience with donation linking and account management.** 🚀
