import * as core from '@actions/core'
import path from 'path'
import fs from 'fs'
import aws from 'aws-sdk'

async function run(): Promise<void> {
  try {
    const batch = new aws.Batch({
      customUserAgent: 'aws-batch-register-job-definition-for-github-actions'
    })

    // Get inputs
    const jobDefinitionFile = core.getInput('job-definition', {required: true})

    // Register the job definition
    core.debug('Registering the job definition')
    const jobDefPath = path.isAbsolute(jobDefinitionFile)
      ? jobDefinitionFile
      : path.join(process.env.GITHUB_WORKSPACE || '', jobDefinitionFile)
    const fileContents = fs.readFileSync(jobDefPath, 'utf8')
    const jobDefContents = JSON.parse(fileContents)
    const registerResponse = await batch
      .registerJobDefinition(jobDefContents)
      .promise()
    const jobDefArn = registerResponse.jobDefinitionArn
    core.setOutput('job-definition-arn', jobDefArn)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
