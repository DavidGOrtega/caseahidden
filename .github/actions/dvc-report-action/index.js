const core = require('@actions/core');
const github = require('@actions/github');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fs = require('fs')

const github_token = core.getInput('github_token');
const dvc_repro_file = core.getInput('dvc_repro_file');
const dvc_repro_skip = core.getInput('dvc_repro_skip');
const dvc_push = core.getInput('dvc_push');
const skip_ci = core.getInput('skip_ci');

const GITHUB_SHA = process.env.GITHUB_SHA;
const GITHUB_ACTOR = process.env.GITHUB_ACTOR;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_REF = process.env.GITHUB_REF;

const [owner, repo] = GITHUB_REPOSITORY.split('/');
const octokit = new github.GitHub(github_token);



const exe = async (command) => {
  const { stdout, stderr } = await exec(command);

  if (stderr) throw new Error(stderr);

  return stdout;
}


const data_report_summary_md = async () => {

  // TODO: extract file sizes and info from dcv changed files
  const git_out = await exe('git diff --name-only $(git rev-parse HEAD~1) $(git rev-parse HEAD)');

  //1799 files untouched, 0 files modified, 1000 files added, 1 file deleted, size was increased by 23.0 MB
  const dvc_out = await exe('dvc diff $(git rev-parse HEAD~1) $(git rev-parse HEAD)');

  const regex = /(\d+) files? untouched, (\d+) files? modified, (\d+) files? added, (\d+) files? deleted/g;
  const match = regex.exec(dvc_out);

  const sections = [
    { lbl: 'New', total: match[3] },
    { lbl: 'Modified', total: match[2] },
    { lbl: 'Deleted', total: match[4] },
  ];

  let summary = '';
  sections.forEach(section => {
    summary += ` - ${section.lbl} files: ${section.total}  \n`;

    for (const i=0; i<section.total; i++)
      summary += '    - dummy.png\t\t30Mb\n';
  });

  return summary;
}


const check_dvc_data_report = async () => {

  const started_at = new Date();
  const name = 'DVC Data Report';
  const conclusion = 'success';
  const title = 'Checksum Test';
  const summary = await data_report_summary_md();

  await octokit.checks.create({
    owner,
    repo,
    GITHUB_SHA,

    started_at,
    name,
    conclusion,
    completed_at: new Date(),
    status: 'completed',
    output: {
      title,
      summary
    }
  })
}


const run_action = async () => {

  try {
    console.log('Checking skip');
    const last_log = await exe('git log -1');
    if (last_log.includes(skip_ci)) {
      console.log(`${skip_ci} found! skipping task`);
      return 0;
    }

    console.log('Pulling from dvc remote');
    await exe('dvc pull');

    await check_dvc_data_report();

    const dvc_repro_file_exists = fs.existsSync(dvc_repro_file);
    if (!dvc_repro_skip && dvc_repro_file_exists) {

      console.log(`echo Running dvc repro ${dvc_repro_file}`);
      await exe(`dvc repro ${dvc_repro_file}`);

      const has_changes = false; //if ! git diff-index --quiet HEAD --; then
      if (has_changes) {
        console.log('Pushing to repo');

        await exe(`
          dvc commit -f && \
          git config --local user.email "action@github.com" && \
          git config --local user.name "GitHub Action" && \
          git commit -m "dvc repro ${skip_ci}" -a && \
          git remote add github "https://${GITHUB_ACTOR}:${github_token}@github.com/${GITHUB_REPOSITORY}.git"
          git push github HEAD:${GITHUB_REF}
        `);

        if (dvc_push) {
          console.log('Pushing to dvc remote');
          await exe('dvc push');
        }

      }
      
      if (!dvc_repro_skip && !dvc_repro_file_exists) {
        console.log(`DVC repro file ${dvc_repro_file} not found`);
      }

    }
  
  } catch (error) {
    core.setFailed(error.message);
  }
}


run_action();