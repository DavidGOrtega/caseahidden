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

  const { head_branch, head_sha } = context.payload.check_suite
  context.github.checks.create(context.repo({
    head_branch,
    head_sha,
    started_at: new Date(),
    completed_at: new Date(),
    conclusion,

    name: 'DVC test',
    status: 'completed',
    output: {
      title: 'Checksum test',
      summary: 'skjdsjdskdskdjs',
    }
  }))

} catch (error) {
  core.setFailed(error.message);
}