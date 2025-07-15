const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');
const { exec } = require('child_process'); // Fallback for 'open'

// Scopes define what your app can access (read-only access to Google Tasks)
const SCOPES = ['https://www.googleapis.com/auth/tasks.readonly'];

// Paths to credentials and token files
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');
const TOKEN_PATH = path.join(__dirname, '..', 'token.json');

/**
 * Step 1: Authorize and return a ready-to-use authenticated Google client.
 */
async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_id, client_secret, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Step 2: Check if token.json exists (already authorized)
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Step 3–6: If no token, start full OAuth2 flow
  return await getNewToken(oAuth2Client);
}

/**
 * Step 3: Redirect user to Google Consent Page
 * Step 4: User logs in and grants access
 * Step 5–6: Exchange code for token, save token.json
 */
function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('\n-- Open this URL to authorize access:\n' + authUrl);

    // Try to auto-open browser using default command
    exec(`start "" "${authUrl}"`);

    // Step 5: Ask user to paste the code
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('\n-- Paste the code from the browser here: ', (code) => {
      rl.close();

      // Step 6: Exchange code for token
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return reject('-- Error retrieving access token: ' + err);
        oAuth2Client.setCredentials(token);

        // Step 6: Save token.json for future runs
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log('-- Access token saved to', TOKEN_PATH);

        resolve(oAuth2Client);
      });
    });
  });
}

/**
 * Step 7: Get all Task Lists (like "My Tasks", "Work", etc.)
 */
async function getTaskLists(auth) {
  const service = google.tasks({ version: 'v1', auth });
  const res = await service.tasklists.list();
  const taskLists = res.data.items || [];

  return taskLists.map((list) => ({
    id: list.id,
    title: list.title,
  }));
}

/**
 * Step 8: Get all tasks from a specific task list
 */
async function getTasksFromList(auth, taskListId) {
  const service = google.tasks({ version: 'v1', auth });
  const res = await service.tasks.list({ tasklist: taskListId });
  const tasks = res.data.items || [];

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.notes || '', 
    status: task.status,
    due: task.due || null,
  }));
}
/**
 * Step 9: Get all tasks from all task lists
 */
async function getGoogleTasks() {
  const auth = await authorize();
  const taskLists = await getTaskLists(auth);

  let allTasks = [];

  for (const list of taskLists) {
    const tasks = await getTasksFromList(auth, list.id);
    const tasksWithList = tasks.map((task) => ({
      ...task,
      listTitle: list.title,
    }));

    allTasks = allTasks.concat(tasksWithList);
  }

  return allTasks;
}

module.exports = {
  authorize,
  getTaskLists,
  getTasksFromList,
  getGoogleTasks,
};
