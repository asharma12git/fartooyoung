// Example bounce handling Lambda function for when SES is restored
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({ region: process.env.AWS_REGION })
const docClient = DynamoDBDocumentClient.from(client)

exports.handler = async (event) => {
  console.log('Bounce/Complaint event received:', JSON.stringify(event, null, 2))

  try {
    // Parse SNS message
    const message = JSON.parse(event.Records[0].Sns.Message)
    
    if (message.eventType === 'bounce') {
      await handleBounce(message.bounce)
    } else if (message.eventType === 'complaint') {
      await handleComplaint(message.complaint)
    }

    return { statusCode: 200, body: 'Processed successfully' }
  } catch (error) {
    console.error('Error processing bounce/complaint:', error)
    return { statusCode: 500, body: 'Processing failed' }
  }
}

async function handleBounce(bounce) {
  for (const recipient of bounce.bouncedRecipients) {
    const email = recipient.emailAddress
    
    // Add to suppression list in DynamoDB
    await docClient.send(new UpdateCommand({
      TableName: process.env.USERS_TABLE,
      Key: { email },
      UpdateExpression: 'SET email_suppressed = :suppressed, suppression_reason = :reason',
      ExpressionAttributeValues: {
        ':suppressed': true,
        ':reason': `Bounce: ${bounce.bounceType}`
      }
    }))
    
    console.log(`Suppressed email due to bounce: ${email}`)
  }
}

async function handleComplaint(complaint) {
  for (const recipient of complaint.complainedRecipients) {
    const email = recipient.emailAddress
    
    // Add to suppression list
    await docClient.send(new UpdateCommand({
      TableName: process.env.USERS_TABLE,
      Key: { email },
      UpdateExpression: 'SET email_suppressed = :suppressed, suppression_reason = :reason',
      ExpressionAttributeValues: {
        ':suppressed': true,
        ':reason': 'Complaint'
      }
    }))
    
    console.log(`Suppressed email due to complaint: ${email}`)
  }
}
