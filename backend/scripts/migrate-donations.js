const AWS = require('aws-sdk');

const TABLE_NAME = 'fartooyoung-production-donations-table';
AWS.config.update({ region: 'us-east-1' });
const dynamo = new AWS.DynamoDB.DocumentClient();

function transformItem(item) {
  const card = item.paymentMethodDetails?.card;
  const wallet = card?.wallet?.type || null;

  return {
    id: item.id,
    email: item.email || 'unknown',
    name: item.name || 'Unknown',
    amount: item.amount || 0,
    type: item.type || 'one-time',
    status: item.status || 'unknown',
    paymentMethod: item.paymentMethod || 'unknown',
    cardBrand: card?.brand || null,
    cardLast4: card?.last4 || null,
    wallet: wallet,
    stripeInvoiceId: item.stripeInvoiceId || null,
    stripeSubscriptionId: item.stripeSubscriptionId || null,
    stripeSessionId: item.stripeSessionId || null,
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

async function migrate() {
  console.log(`Scanning ${TABLE_NAME}...`);
  const { Items } = await dynamo.scan({ TableName: TABLE_NAME }).promise();
  console.log(`Found ${Items.length} items to migrate.\n`);

  let success = 0;
  let errors = 0;

  for (const item of Items) {
    try {
      const newItem = transformItem(item);
      await dynamo.put({ TableName: TABLE_NAME, Item: newItem }).promise();
      console.log(`✓ ${item.id}`);
      success++;
    } catch (err) {
      console.error(`✗ ${item.id} - ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone. Success: ${success}, Errors: ${errors}`);
}

migrate();
