const { Client } = require('@notionhq/client');
require('dotenv').config(); // To load NOTION_TOKEN and NOTION_DATABASE_ID from .env

// STEP 1: Initialize Notion Client with your integration token
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// STEP 2: Get database ID from .env
const databaseId = process.env.NOTION_DATABASE_ID;

/**
 * STEP 3: Insert a new task into Notion database
 * 
 * @param {Object} task - Task object from Google
 * @param {string} task.title - Title of the task
 * @param {string} task.status - Status (e.g. 'completed', 'needsAction')
 * @param {string|null} task.due - Due date in ISO format (e.g. 2025-07-11)
 */
async function insertTaskToNotion(task) {
  const { title, description,status, due } = task;

  // Map Google Task status to Notion
  const statusMap = {
    needsAction: 'Not Started',
    completed: 'Completed',
  };

  try {
    // STEP 4: Send the request to Notion API
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Task: {
          title: [
            {
              text: {
                content: title || 'Untitled Task',
              },
            },
          ],
        },
         Description: description
          ? {
              rich_text: [
                {
                  text: {
                    content: description,
                  },
                },
              ],
            }
          : undefined,
        Status: {
          status: {
            name: statusMap[status] || 'Not Started', // Fallback if unknown
          },
        },
        Due: due
          ? {
              date: {
                start: due,
              },
            }
          : undefined,
      },
    });

    console.log(`-- Task "${title}" added to Notion.`);
    return response;
  } catch (error) {
    console.error(`-- Failed to insert task "${title}"`, error.body || error);
  }
}

module.exports = {
  insertTaskToNotion,
};
