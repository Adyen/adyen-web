// A script to mark all GitHub releases in a repository as [DEPRECATED].
// Uses the GitHub REST API and supports a dry run mode.

const fetch = require('node-fetch');

// --- Configuration ---
// Load these from environment variables for security.
// DO NOT hardcode your token here.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'adyen';
const REPO_NAME = 'adyen-web';
// Dry run set to true by default, set DRY_RUN=false to run for real
const DRY_RUN = process.env.DRY_RUN !== 'false';
// Major version filter - only releases starting with this version will be deprecated
const MAJOR_VERSION = process.env.MAJOR_VERSION;

// --------------------

const API_BASE_URL = 'https://api.github.com';
const DEPRECATED_PREFIX = '[DEPRECATED]';

/**
 * Fetches all releases from a GitHub repository, handling pagination.
 * @returns {Promise<Array>} A promise that resolves to an array of release objects.
 */
async function fetchAllReleases() {
  let allReleases = [];
  let page = 1;
  
  console.log('Fetching all releases...');

  while (true) {
    const url = `${API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/releases?page=${page}&per_page=100`;
    const response = await fetch(url, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch releases: ${response.statusText}`);
    }

    const releasesPage = await response.json();
    if (releasesPage.length === 0) {
      break;
    }

    allReleases = allReleases.concat(releasesPage);
    page++;
  }

  console.log(`Found a total of ${allReleases.length} releases.`);
  return allReleases;
}

/**
 * Updates a single release by adding the [DEPRECATED] prefix to its title.
 * In dry run mode, it only logs the intended action.
 * @param {object} release - The release object from the GitHub API.
 */
async function deprecateRelease(release) {
  if (release.name.startsWith(DEPRECATED_PREFIX)) {
    console.log(`- Skipping "${release.name}" (already deprecated).`);
    return;
  }

  // Filter by major version if specified
  if (MAJOR_VERSION && !release.name.startsWith(MAJOR_VERSION)) {
    console.log(`- Skipping "${release.name}" (not version ${MAJOR_VERSION}.x).`);
    return;
  }

  const newTitle = `${release.name} ${DEPRECATED_PREFIX}`;

  // --- DRY RUN LOGIC ---
  if (DRY_RUN) {
    console.log(`- [DRY RUN] Would update "${release.name}" to "${newTitle}".`);
    return; // Exit before making the API call
  }
  // ---------------------

  const url = `${API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/releases/${release.id}`;
  
  console.log(`- Updating "${release.name}"...`);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({ name: newTitle })
  });

  if (!response.ok) {
    console.error(`  Failed to update "${release.name}": ${response.statusText}`);
  } else {
    console.log(`  Successfully updated to "${newTitle}".`);
  }
}

/**
 * Main function to run the script.
 */
async function main() {
  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    console.error('Error: Make sure GITHUB_TOKEN, REPO_OWNER, and REPO_NAME are set as environment variables.');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('*** DRY RUN MODE ENABLED: No actual changes will be made. ***\n');
  }

  if (MAJOR_VERSION) {
    console.log(`*** MAJOR VERSION FILTER: Only releases starting with "${MAJOR_VERSION}" will be processed. ***\n`);
  } else {
    console.log('*** NO VERSION FILTER: All releases will be processed. Set MAJOR_VERSION to filter by version. ***\n');
  }

  try {
    const releases = await fetchAllReleases();
    
    if (releases.length === 0) {
      console.log('No releases to update.');
      return;
    }

    console.log('\nStarting deprecation process...');
    for (const release of releases) {
      await deprecateRelease(release);
    }
    console.log('\nProcess complete! ✨');

  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
  }
}

main();