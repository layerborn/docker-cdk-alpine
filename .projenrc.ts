import { cdk } from 'projen';
const project = new cdk.JsiiProject({
  author: 'Jayson Rawlins',
  authorAddress: 'jayson.rawlins@layerborn.io',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'docker-cdk-alpine',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/layerborn/docker-cdk-alpine.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();