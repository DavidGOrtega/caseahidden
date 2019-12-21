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
        summary: 'skjdsjdskdskdjs',
      }
    })
  
    console.log(github);
    console.log(github.context);
    console.log(github.context.payload);
    const repo_checks = await octokit.checks.listForRef({
      owner,
      repo,
      ref: head_sha,
    });

    console.log(repo_checks);

    /* octokit.checks.update({
      check_run_id: ,
      owner: 'DavidGOrtega',
      repo: 'caseahidden',
      head_sha: github.context.sha,
  
      started_at: new Date(),
      completed_at: new Date(),
      conclusion: 'success',
  
      name: 'DVC test',
      status: 'completed',
      output: {
        title: 'Checksum test',
        summary: 'skjdsjdskdskdjs',
      }
    }) */
  
  } catch (error) {
    core.setFailed(error.message);
  }
}

checks();