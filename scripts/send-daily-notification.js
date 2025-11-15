const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Send daily push notification to subscribed users
 * This script should run daily after the changelog is generated
 * It posts to a notification service that handles the actual push delivery
 */

const changelogPath = path.join(__dirname, '../data/changelog.json');

// Check if there's a recent changelog entry (from today)
function getLatestChangelogEntry() {
  if (!fs.existsSync(changelogPath)) {
    return null;
  }

  const entries = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));
  if (entries.length === 0) return null;

  const latestEntry = entries[entries.length - 1];
  const entryDate = new Date(latestEntry.date).toDateString();
  const todayDate = new Date().toDateString();

  // Only return if entry is from today
  if (entryDate === todayDate) {
    return latestEntry;
  }

  return null;
}

async function sendNotification() {
  const latestEntry = getLatestChangelogEntry();

  if (!latestEntry) {
    console.log('No changelog entry from today - skipping notification');
    return;
  }

  const { changes, summary } = latestEntry;

  // Build notification message
  const message = buildNotificationMessage(changes, summary);

  console.log('Sending notification:');
  console.log(message);

  // If you have a notification service, send to it here
  // Example with a custom webhook or notification API:
  if (process.env.NOTIFICATION_WEBHOOK_URL) {
    await sendToWebhook(process.env.NOTIFICATION_WEBHOOK_URL, {
      title: '🆕 Arc Raiders Database Updated',
      message: message,
      changes: changes,
      summary: summary,
      link: 'https://www.arcraidersdatabase.com/changelog',
      timestamp: new Date().toISOString(),
    });
  }

  // You could also log this for a frontend to pick up
  const notificationQueuePath = path.join(__dirname, '../data/notification-queue.json');
  const queue = fs.existsSync(notificationQueuePath)
    ? JSON.parse(fs.readFileSync(notificationQueuePath, 'utf-8'))
    : [];

  queue.push({
    id: `notif-${Date.now()}`,
    title: '🆕 Arc Raiders Database Updated',
    message: message,
    changes: changes,
    summary: summary,
    timestamp: new Date().toISOString(),
    read: false,
  });

  // Keep only last 7 days of notifications
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  queue = queue.filter(notif => new Date(notif.timestamp).getTime() > sevenDaysAgo);

  fs.writeFileSync(notificationQueuePath, JSON.stringify(queue, null, 2));
  console.log('Notification queued for frontend delivery');
}

function buildNotificationMessage(changes, summary) {
  const parts = [];

  if (changes.added.length > 0) {
    parts.push(`✨ ${changes.added.length} new item${changes.added.length !== 1 ? 's' : ''}`);
  }

  if (changes.modified.length > 0) {
    parts.push(`📝 ${changes.modified.length} item${changes.modified.length !== 1 ? 's' : ''} updated`);
  }

  if (changes.removed.length > 0) {
    parts.push(`❌ ${changes.removed.length} item${changes.removed.length !== 1 ? 's' : ''} removed`);
  }

  return parts.join(' • ');
}

async function sendToWebhook(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(webhookUrl, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('Webhook notification sent successfully');
          resolve(true);
        } else {
          console.log(`Webhook returned status ${res.statusCode}`);
          reject(new Error(`Webhook returned ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error sending webhook:', error.message);
      reject(error);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

sendNotification().catch((error) => {
  console.error('Error in sendNotification:', error);
  process.exit(1);
});
