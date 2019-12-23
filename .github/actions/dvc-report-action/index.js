const core = require('@actions/core');
const github = require('@actions/github');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const exe = async (command) => {
  const { stdout, stderr } = await exec(command);
  //if (stderr) throw new Error(stderr);

  return stdout;
}

const dvc_install = async () => {
  exe("yes | pip install dvc");
}

const summaryMD = async () => {
  const dvc = await exe('dvc diff $(git rev-parse HEAD~1) $(git rev-parse HEAD)');

  return `
  ${dvc}  

   - New data files:
    - sources/file1.txt  5Mb
   - Modified data files:
    - model.pkl  65Mb
    - + processed/  741 files total
   - Deleted files:
    - sources/mapping.pkl   31Mb
  `;
}

const checks = async () => {
  try {
    console.log(github.context);
    console.log(github.context.payload);
    console.log(JSON.stringify(github.context));

    const owner = 'DavidGOrtega';
    const repo = 'caseahidden';
    const head_sha = github.context.sha;
    const myToken = core.getInput('github_token');

    const octokit = new github.GitHub(myToken);
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