#!/usr/bin/env node
/**
 * Set Vercel project Root Directory to veridion-landing via API.
 * Requires: VERCEL_TOKEN (from vercel login or dashboard token).
 * Optional: .vercel/project.json (from vercel link) or set PROJECT_ID and TEAM_ID env vars.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = 'veridion-landing';
const VERCEL_API = 'api.vercel.com';

function getConfig() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    console.error('Set VERCEL_TOKEN (e.g. from https://vercel.com/account/tokens or after running `vercel login`).');
    process.exit(1);
  }

  let projectId = process.env.PROJECT_ID;
  let teamId = process.env.TEAM_ID || process.env.ORG_ID;

  const vercelPath = path.join(process.cwd(), '.vercel', 'project.json');
  if ((!projectId || !teamId) && fs.existsSync(vercelPath)) {
    const data = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    projectId = projectId || data.projectId;
    teamId = teamId || data.orgId;
  }

  if (!projectId) {
    console.error('Set PROJECT_ID or run `vercel link` in this repo to create .vercel/project.json');
    process.exit(1);
  }
  if (!teamId) {
    console.error('Set TEAM_ID (or ORG_ID) or run `vercel link` to create .vercel/project.json');
    process.exit(1);
  }

  return { token, projectId, teamId };
}

function patchProject(token, projectId, teamId) {
  const body = JSON.stringify({ rootDirectory: ROOT_DIR });
  const url = `/v9/projects/${encodeURIComponent(projectId)}?teamId=${encodeURIComponent(teamId)}`;
  const options = {
    hostname: VERCEL_API,
    path: url,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(json.error?.message || json.message || data || `HTTP ${res.statusCode}`));
        } catch {
          reject(new Error(data || `HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const { token, projectId, teamId } = getConfig();
  console.log(`Setting Root Directory to "${ROOT_DIR}" for project ${projectId}...`);
  await patchProject(token, projectId, teamId);
  console.log('Done. Root Directory is now "%s". Future deployments will use it.', ROOT_DIR);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
