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
  //1799 files untouched, 0 files modified, 1000 files added, 1 file deleted, size was increased by 23.0 MB
  const dvc_out = await exe('dvc diff $(git rev-parse HEAD~1) $(git rev-parse HEAD)');
  const regex = /(\d+) files untouched, (\d+) files modified, (\d+) files added, (\d+) file deleted/g;
  const match = regex.exec(dvc_out);
  console.log(match);

  const sections = [
    { lbl: 'New', total: match[3] },
    { lbl: 'Modified', total: match[2] },
    { lbl: 'Deleted', total: match[4] },
  ];

  let summary = '';
  sections.forEach(section => {
    summary += `  - ${section.lbl} files:\n\s ${section.total} files total`;
  });

  return `
    ${dvc}

    ${summary}
  `;
}

const checks = async () => {
  try {
    await exe('ls -R data | wc -l');

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