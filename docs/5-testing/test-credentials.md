# Far Too Young - Test Credentials & API Testing

## 🔐 Authentication Test Credentials

### Working User Account (Created & Verified):
- **Email**: gary@test.com
- **Password**: OldPass123!
- **Status**: ✅ Active in DynamoDB Local
- **Last Updated**: 2025-11-23 (Password reset via forgot-password flow)

### 🧪 API Testing Endpoints

**Base URL**: `http://localhost:3001`

### Register New User:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@test.com", "password": "test123", "name": "New User"}'
```

### Login Existing User:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "gary@test.com", "password": "test123"}'
```

### Logout User:
```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 💳 Payment Test Information (Stripe)

### Test Card Details:
- **Card Number**: 4242424242424242
- **Expiration**: 12/25 (any future date)
- **CVC**: 123 (any 3 digits)
- **Name**: Any name
- **ZIP**: Any ZIP code

## 🔄 Complete Authentication Flow Test

### Frontend Testing (when connected):
1. **Register Flow**:
   - Open React app at `http://localhost:5173`
   - Click "Login" → Switch to "Register" tab
   - Enter: Email, Password, Name
   - Should redirect to dashboard on success

2. **Login Flow**:
   - Use credentials: gary@test.com / test123
   - Should receive JWT token and redirect to dashboard

3. **Dashboard Access**:
   - Verify user profile shows correct name/email
   - Check all dashboard tabs load properly
   - Test logout functionality

### Backend Testing (current working state):
1. **Start Local Environment**:
   ```bash
   # Terminal 1: DynamoDB Local
   docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
   
   # Terminal 2: SAM CLI API
   cd /Users/avinashsharma/WebstormProjects/fartooyoung/backend
   sam local start-api --port 3001
   ```

2. **Verify Database**:
   ```bash
   # Check user exists
   export AWS_ACCESS_KEY_ID=dummy && export AWS_SECRET_ACCESS_KEY=dummy
   aws dynamodb get-item \
     --table-name fartooyoung-users \
     --key '{"email": {"S": "gary@test.com"}}' \
     --endpoint-url http://192.168.1.199:8000 \
     --region us-east-1
   ```

## 🎯 Donation Testing (Future Integration)

### Complete Donation Flow:
1. **Login as Gary**:
   - Email: gary@test.com
   - Password: test123

2. **Access Donation Modal**:
   - Click "Donate" button (header or dashboard)

3. **Step 1 - Choose Amount**:
   - Select preset amount or enter custom
   - Choose "One-time" or "Monthly"
   - Click "Next"

4. **Step 2 - Payment Details**:
   - **First Name**: Gary
   - **Last Name**: Test  
   - **Email**: gary@test.com
   - **Payment Method**: Select "Stripe"
   - **Card Details**: Use test card above

5. **Process Donation**:
   - Click "Donate" - Should process successfully
   - Check dashboard for updated metrics

### Alternative Payment Method:
- **PayPal**: No card details required, just click "Donate"

## 📊 Expected Results

### After Successful Authentication:
- JWT token returned in response
- User redirected to `/dashboard`
- User profile data displayed correctly
- All dashboard tabs accessible

### After Successful Donation:
- Donation appears in dashboard history
- Impact metrics updated
- Progress bars reflect new totals
- Thank you message displayed

## 🐛 Troubleshooting

### If APIs Don't Work:
1. Check all 3 services are running (React, SAM, DynamoDB)
2. Verify DynamoDB table exists: `fartooyoung-users`
3. Check SAM CLI logs for specific errors
4. Ensure host IP is correct in template.yaml

### If Database Issues:
1. Restart DynamoDB Local container
2. Recreate table if needed
3. Check AWS credentials are set (dummy values)

### Common Issues Fixed:
- ✅ Lambda dependencies resolved
- ✅ UUID compatibility fixed  
- ✅ DynamoDB networking configured
- ✅ bcrypt performance optimized
- ✅ Environment variables set correctly

## 📝 Notes

- **Local Testing**: All authentication endpoints working perfectly
- **Database**: Complete user schema implemented with future-ready fields
- **Security**: Passwords properly hashed, JWT tokens functional
- **Performance**: Optimized for local development (bcrypt salt rounds: 4)
- **Production Ready**: Core system ready for AWS deployment