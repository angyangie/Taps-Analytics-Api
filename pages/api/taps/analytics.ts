import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import rateLimit from '../../../lib/rateLimiter';
import { Team } from '@prisma/client';

// Initializes the rate limiter with default values defined in rateLimiter.ts
const limiter = rateLimit();

// Set of accepted interval units for aggregating tap data
const acceptedIntervals = new Set(["hour", "day", "week", "month", "quarter"]);

/**
 * Validates the provided API token and retrieves the associated team.
 *
 * @param {string} token - The API token to validate.
 * @param {NextApiResponse} res - The response object.
 * @returns {Promise<Team | null>} The team associated with the token or null if invalid.
 */
async function validateToken(token: string, res: NextApiResponse): Promise<Team | null> {
  const team = await prisma.team.findUnique({ where: { token } });
  if (!team) {
    res.status(401).json({ error: "Invalid API key" });
    return null;
  }
  return team;
}

/**
 * API handler function to aggregate tap data for a team within a specified date range.
 *
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Destructure and validate the request query parameters
  const { token, interval, start_date, end_date } = req.query;

  // Check for missing query parameters or improper use of arrays in query parameters
  if (!token || !interval || !start_date || !end_date) {
    res.status(400).json({ error: "Invalid request parameters" });
    return;
  }

  if (Array.isArray(token) || Array.isArray(interval) || 
      Array.isArray(start_date) || Array.isArray(end_date)) {
    res.status(400).json({ error: "Query parameters should not be arrays" });
    return;
  }

  // Enforce rate limiting based on the token
  try {
    await limiter.check(res, 100, token);
  } catch {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  // Validate the API token
  const team = await validateToken(token, res);
  if (!team) return;

  // Ensure the requested interval is one of the accepted intervals
  const intervalLower = interval.toLowerCase();
  if (!acceptedIntervals.has(intervalLower)) {
    res.status(400).json({ error: "Invalid interval format" });
    return;
  }

  // Parse and validate start and end dates
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  if (isNaN(startDate.valueOf()) || isNaN(endDate.valueOf())) {
    res.status(400).json({ error: "Invalid dates" });
    return;
  }

  // Query the database to aggregate taps data
  // Can be changed to pull information for specific tags only
  try {
    const aggregatedTaps = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${intervalLower}, created_at) AS time_period, 
        COUNT(*) as count
      FROM "Tap"
      WHERE
        "tagUid" IN (SELECT "tagUid" FROM "Tag" WHERE "teamId" = ${team.id})
        AND (created_at BETWEEN ${startDate} AND ${endDate})
      GROUP BY time_period
      ORDER BY time_period
    `;

    // Convert bigint to string in the JSON response
    const parsedAggregatedTaps = JSON.parse(
      JSON.stringify(aggregatedTaps, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.status(200).json(parsedAggregatedTaps);
  } catch (error) {
    console.error("Request failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
