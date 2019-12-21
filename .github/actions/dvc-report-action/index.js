const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  console.log(github);
  const myToken = core.getInput('who-to-greet');

  const octokit = new github.GitHub(myToken);
  octokit.checks.create({
    owner: 'DavidGOrtega',
    repo:'caseahidden',
    head_sha: github.context.sha,

    started_at: new Date(),
    completed_at: new Date(),
    conclusion,

    name: 'DVC test',
    status: 'completed',
    output: {
      title: 'Checksum test',
      summary: 'skjdsjdskdskdjs',
    }
  })

} catch (error) {
  core.setFailed(error.message);
}