const core = require('@actions/core');
const github = require('@actions/github');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const exe = async (command) => {
  const { stdout, stderr } = await exec(command);
  if (stderr) throw new Error(stderr);

  return stdout;
}

const summaryMD = async () => {
  //diff $(git rev-parse HEAD~1) $(git rev-parse HEAD)
  const dvc = await exe('dvc -h');

  return `
   - New data files:
      - sources/file1.txt  5Mb
   - Modified data files:
      - model.pkl  65Mb
      + processed/  741 files total
   - Deleted files:
      - sources/mapping.pkl   31Mb
  `;
}

const checks = async () => {
  try {
    const github_token = core.getInput('github_token');
    const octokit = new github.GitHub(github_token);

    const repo_parts = process.env.GITHUB_REPOSITORY.split('/');

    const owner = repo_parts[0];
    const repo = repo_parts[1];
    const head_sha = process.env.GITHUB_SHA;
    const started_at = new Date();
    const name = 'DVC Report';

    await octokit.checks.create({
      owner,
      repo,
      head_sha,
      started_at,
      name,
      status: 'in_progress'
    })

    const conclusion = 'success';
    const title = 'Checksum Test';
    const summary = await summaryMD();

    await octokit.checks.create({
      owner,
      repo,
      head_sha,
      started_at,
      conclusion,

      completed_at: new Date(),
      name,
      status: 'completed',
      output: {
        title,
        summary
      }
    })
  
  } catch (error) {
    core.setFailed(error.message);
  }
}

checks();