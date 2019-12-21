const core = require('@actions/core');
const github = require('@actions/github');


async function checks() {
  try {
    const myToken = core.getInput('github_token');
  
    const octokit = new github.GitHub(myToken);
    const owner = 'DavidGOrtega';
    const repo = 'caseahidden';
    const head_sha = github.context.sha;

    await octokit.checks.create({
      owner,
      repo,
      head_sha,
  
      started_at: new Date(),
      completed_at: new Date(),
      conclusion: 'success',
  
      name: 'DVC Report',
      status: 'completed',
      output: {
        title: 'Checksum test',
        summary: JSON.stringify([github.context.payload.before, github.context.payload.after]),
      }
    })
  
  } catch (error) {
    core.setFailed(error.message);
  }
}

checks();