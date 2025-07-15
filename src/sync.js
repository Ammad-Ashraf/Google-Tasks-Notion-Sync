const fs = require('fs');
const path = require('path');

const { getGoogleTasks } = require('./google');
const { insertTaskToNotion } = require('./notion');

// Path to local file to track synced task IDs
const SYNCED_TASKS_FILE = path.join(__dirname, '../synced_tasks.json');

// STEP 1: Read previously synced task IDs
function loadSyncedTaskIds() {
  try {
    const data = fs.readFileSync(SYNCED_TASKS_FILE, 'utf8');
    return new Set(JSON.parse(data));
  } catch (err) {
    return new Set(); // If file doesn't exist, start fresh
  }
}

// STEP 2: Save updated synced task IDs
function saveSyncedTaskIds(taskIdSet) {
  const data = JSON.stringify([...taskIdSet], null, 2);
  fs.writeFileSync(SYNCED_TASKS_FILE, data, 'utf8');
}

/**
 * STEP 3: Main function to sync Google Tasks to Notion
 */
async function syncGoogleTasksToNotion() {
  console.log('-- Starting sync process...');

  const syncedIds = loadSyncedTaskIds();
  const newSyncedIds = new Set(syncedIds);

  const tasks = await getGoogleTasks();

  if (!tasks || tasks.length === 0) {
    console.log('-- No tasks found.');
    return;
  }

  // Optional filtering: only sync tasks that are not completed
  const pendingTasks = tasks.filter(
    (task) =>
      task.status !== 'completed' &&
      task.title &&
      !syncedIds.has(task.id) // Avoid duplicates
  );

  if (pendingTasks.length === 0) {
    console.log('-- No new pending tasks to sync.');
    return;
  }

  for (const task of pendingTasks) {
    try {
      await insertTaskToNotion(task);
      newSyncedIds.add(task.id); // Add to synced list
    } catch (err) {
      console.error(`-- Error syncing task "${task.title}"`, err.message);
    }
  }

  saveSyncedTaskIds(newSyncedIds);
  console.log('-- Sync complete.');
}

module.exports = {
  syncGoogleTasksToNotion,
};
