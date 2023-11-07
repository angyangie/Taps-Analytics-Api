const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

// Instantiate a new Prisma Client
const prisma = new PrismaClient();

// File paths to the CSV files
const teamCsvPath = 'teams.csv';
const tagCsvPath = 'tags.csv';
const tapCsvPath = 'taps.csv';

/**
 * Imports teams from a CSV file into the database.
 */
async function importTeams() {
  return new Promise((resolve) => {
    const teams = [];

    fs.createReadStream(teamCsvPath)
      .pipe(csv())
      .on('data', (data) => teams.push(data))
      .on('end', async () => {
        // Iterate over each team record and insert into the database
        for (const record of teams) {
          const existingTeam = await prisma.team.findFirst({
            where: {
              id: parseInt(record.id, 10),
            },
          });

          if (!existingTeam) {
            await prisma.team.create({
              data: {
                id: parseInt(record.id, 10),
                name: record.name,
              },
            });
          }
        }
        resolve();
      });
  });
}

/**
 * Imports tags from a CSV file into the database.
 */
async function importTags() {
  return new Promise((resolve) => {
    const tags = [];

    fs.createReadStream(tagCsvPath)
      .pipe(csv())
      .on('data', (data) => tags.push(data))
      .on('end', async () => {
        // Iterate over each tag record and insert into the database
        for (const record of tags) {
          const existingTag = await prisma.tag.findFirst({
            where: {
              tagUid: parseInt(record.tagUid, 10),
            },
          });

          if (!existingTag) {
            await prisma.tag.create({
              data: {
                tagUid: parseInt(record.tagUid, 10),
                teamId: parseInt(record.teamId, 10),
                createdAt: new Date(record.created_at),
              },
            });
          }
        }
        resolve();
      });
  });
}

/**
 * Imports taps from a CSV file into the database.
 */
async function importTaps() {
  return new Promise((resolve) => {
    const taps = [];

    fs.createReadStream(tapCsvPath)
      .pipe(csv())
      .on('data', (data) => taps.push(data))
      .on('end', async () => {
        // Iterate over each tap record and insert into the database
        for (const record of taps) {
          const existingTap = await prisma.tap.findFirst({
            where: {
              tagUid: parseInt(record.tagUid, 10),
              createdAt: new Date(record.createdAt),
            },
          });

          if (!existingTap) {
            await prisma.tap.create({
              data: {
                tagUid: parseInt(record.tagUid, 10),
                count: parseInt(record.count, 10),
                createdAt: new Date(record.createdAt),
              },
            });
          }
        }
        resolve();
      });
  });
}

/**
 * Main function to run the import scripts.
 */
async function main() {
  await importTeams();
  await importTags();
  await importTaps();

  console.log('Import finished.');
}

// Execute the main function and handle any errors
// Run `node bulkImport.js` locally to populate local postgres database
main()
  .catch((e) => {
    console.error('Error during import:', e);
  })
  .finally(async () => {
    // Ensure that the Prisma Client connection is closed
    await prisma.$disconnect();
  });
