const core = require('@actions/core');
const github = require('@actions/github');


function sleep(ms){
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}


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

    console.log(repo_checks.data);
    await sleep(20);
    for (idx in repo_checks.data) {
      console.log(idx);
      const check = repo_checks.data[idx];
      if (check.name === 'run') {
        console.log('HEHRHEHRHEHEHRHEH');

        octokit.checks.update({
          check_run_id: check.id,
          owner: 'DavidGOrtega',
          repo: 'caseahidden',
          head_sha: github.context.sha,
      
          started_at: new Date(),
          completed_at: new Date(),
          conclusion: 'success',
      
          name: 'dvc report',
          status: 'completed',
          output: {
            title: 'hijacked!',
            summary: 'this check is hijacked!',
          }
        }) 
      }
          
     }
  
  } catch (error) {
    core.setFailed(error.message);
  }
}

checks();