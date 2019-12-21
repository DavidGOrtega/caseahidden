const core = require('@actions/core');
const github = require('@actions/github');

try {
  const myToken = core.getInput('who-to-greet');

  const octokit = new github.GitHub(myToken);
  octokit.checks.create({
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
  })

  console.log(github);
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