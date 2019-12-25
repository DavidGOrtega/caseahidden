const core = require('@actions/core');
const github = require('@actions/github');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fs = require('fs')
const path = require('path');

const github_token = core.getInput('github_token');
const dvc_repro_file = core.getInput('dvc_repro_file');
const dvc_repro_skip = core.getInput('dvc_repro_skip') === 'true';
const skip_ci = core.getInput('skip_ci');

console.log([dvc_repro_skip, dvc_repro_skip === false, dvc_repro_skip === 'false']);

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


const dvc_report_data_md = async () => {
  let summary = 'No data available';

  try {
    // TODO: extract file sizes and info from dcv changed files
    // const git_out = await exe('git diff --name-only $(git rev-parse HEAD~1) $(git rev-parse HEAD)');

    let dvc_out;
    try {
      dvc_out = await exe('dvc diff $(git rev-parse HEAD~1) $(git rev-parse HEAD)');
    
    } catch (err) {
      dvc_out = await exe('dvc diff 4b825dc642cb6eb9a060e54bf8d69288fbee4904 $(git rev-parse HEAD)');
    }
    
    //1799 files untouched, 0 files modified, 1000 files added, 1 file deleted, size was increased by 23.0 MB
    const regex = /(\d+) files? untouched, (\d+) files? modified, (\d+) files? added, (\d+) files? deleted/g;
    const match = regex.exec(dvc_out);

    const sections = [
      { lbl: 'New', total: match[3] },
      { lbl: 'Modified', total: match[2] },
      { lbl: 'Deleted', total: match[4] },
    ];

    summary = '';
    sections.forEach(section => {
      summary += ` - ${section.lbl} files: ${section.total}  \n`;

      for (let i=0; i<section.total; i++)
        summary += `    - ${section.lbl}-dummy.png\t\t30Mb\n`;
    });
  
  } catch (err) {
    console.error(err);
  }

  return summary;
}


const dvc_report_metrics_md = async () => {
  let summary = 'No metrics available';

  try {
    summary = await exe('dvc metrics show');
  
  } catch (err) {
    console.error(err);
  }
 
  return summary;
}


const check_dvc_report_summary = async () => {
  const data = await dvc_report_data_md();
  const metrics = await dvc_report_metrics_md();

  const summary = `### Data  \n${data}  \n### Metrics  \n${metrics}`;

  return summary;
}

const check_dvc_report = async () => {

  const started_at = new Date();
  const name = 'DVC Report';
  const conclusion = 'success';
  const title = 'DVC Report';
  const summary = await check_dvc_report_summary();

  await octokit.checks.create({
    owner,
    repo,
    head_sha: GITHUB_SHA,

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

const octokit_upload_release_asset = async (url, path) => {
  const stat = fs.statSync(path);

  if (!stat.isFile()) {
      console.log(`Skipping ${file}, since its not a file`);
      return;
  }

  const file = fs.readFileSync(file);
  const name = path.basename(file);

  await octokit.repos.uploadReleaseAsset({
      url,
      name,
      file,
      headers: {
          "content-type": "binary/octet-stream",
          "content-length": stat.size
      },
  });
}


const run_repro = async () => {
  
  if (dvc_repro_skip) {
    console.log('DVC repro skipped');
    return;
  }

  const dvc_repro_file_exists = fs.existsSync(dvc_repro_file);
  
  if (!dvc_repro_file_exists) 
    throw new Error(`DVC repro file ${dvc_repro_file} not found`);


  const has_dvc_remote = (await exe('dvc remote list')).length;
  if (has_dvc_remote) {
    console.log('Pulling from dvc remote');
    await exe('dvc pull');
  
  } else {
    console.log('Experiment does not have dvc remote!');
  }

  console.log(`echo Running dvc repro ${dvc_repro_file}`);
  await exe(`dvc repro ${dvc_repro_file}`);

  const has_changes = true; // TODO: if ! git diff-index --quiet HEAD --; then
  if (has_changes) {
    console.log('Pushing...');

    await exe(`
      dvc commit -f && \
      git config --local user.email "action@github.com" && \
      git config --local user.name "GitHub Action" && \
      git commit -a -m "dvc repro ${skip_ci}" && \
      git remote add github "https://${GITHUB_ACTOR}:${github_token}@github.com/${GITHUB_REPOSITORY}.git"
      git push github HEAD:${GITHUB_REF}
    `);

    if (has_dvc_remote) {
      console.log('Pushing to dvc remote');
      await exe('dvc push');
    }


    // TODO: save artifacts as releases
    const release = await octokit.repos.createRelease({
        owner,
        repo,
        head_sha: GITHUB_SHA,

        tag_name: `test_${GITHUB_SHA}`,
    });

    await exe('echo data1 > data.txt');
    await octokit_upload_release_asset(release.data.upload_url, 'data.txt');
    
  }
}

const install_dvc = async () => {
  console.log('installing dvc...')
  exe('pip install dvc');
}

const run_action = async () => {
  try {
    console.log('Checking skip');
    const last_log = await exe('git log -1');
    if (last_log.includes(skip_ci)) {
      console.log(`${skip_ci} found! skipping task`);
      return 0;
    }

    await install_dvc();
    await run_repro();
    await check_dvc_report();
  
  } catch (error) {
    core.setFailed(error.message);
  }
}

run_action();