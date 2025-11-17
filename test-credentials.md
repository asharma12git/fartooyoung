# Test Login Credentials

## Dummy Login (Local Testing)
- **Email**: gary@example.com
- **Password**: any password (dummy authentication)
- **Name**: Gary (auto-generated from email)

## Notes
- These are dummy credentials for local testing only
- Any email/password combination will work in the current setup
- When AWS Cognito is integrated, real authentication will be required
- Each email gets its own donation history stored in localStorage

## Test Flow
1. Click "Login" button in header
2. Enter gary@example.com with any password
3. Access modern 3-tab donor dashboard
4. Make test donations to see real-time stats updates
5. View donation history and user settings
6. Click "Sign out" to logout (X button just closes modal)

## Dashboard Features to Test
- **Stats Cards**: Total donations, lifetime amount, average donation
- **Recent Donations**: Last 4 donations with details
- **Donation History**: Complete transaction history
- **Settings**: Profile and notification preferences
- **Real-time Updates**: Make donations and see dashboard reflect changes

---
*This file is for development testing only and should not be deployed to production*
