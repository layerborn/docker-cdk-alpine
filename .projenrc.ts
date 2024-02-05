import { cdk } from 'projen';

const project = new cdk.JsiiProject({
  author: 'Jayson Rawlins',
  authorAddress: 'jayson.rawlins@layerborn.io',
  keywords: ['aws', 'cdk', 'docker', 'alpine', 'layerborn'],
  defaultReleaseBranch: 'main',
  minNodeVersion: '18.0.0',
  jsiiVersion: '~5.0.0',
  name: 'docker-cdk-alpine',
  projenrcTs: true,
  releaseToNpm: false,
  depsUpgrade: false,
  release: false,
  buildWorkflow: false,
  repositoryUrl: 'https://github.com/layerborn/docker-cdk-alpine.git',
});

project.addTask('docker:build', {
  description: 'Build the Docker image',
  exec: 'docker build . -t layerborn2/docker-cdk-alpine:latest',
});

project.addTask(('docker:test'), {
  description: 'Test the Docker image',
  exec: 'docker run --rm layerborn2/docker-cdk-alpine:latest cdk --version',
});

const dockerHubOrg = 'layerborn2';
const dockerHubRepo = 'docker-cdk-alpine';
const buildDockerImage = project.github?.addWorkflow('build-docker-image');
const publishDockerHub = project.github?.addWorkflow('publish-docker-hub');

publishDockerHub?.on({
  push: {
    branches: ['main'],
  },
});
buildDockerImage?.on({
  push: {
    branches: ['**', '!main'],
  },
});
buildDockerImage?.addJobs({
  build: {
    runsOn: ['ubuntu-latest'],
    permissions: {},
    steps: [
      {
        name: 'Check out the repo',
        uses: 'actions/checkout@v2',
      },
      {
        name: 'Set up QEMU',
        uses: 'docker/setup-qemu-action@v1',
      },
      {
        name: 'Set up Docker Buildx',
        uses: 'docker/setup-buildx-action@v1',
      },
      {
        name: 'Login to DockerHub',
        uses: 'docker/login-action@v1',
        with: {
          username: '${{ secrets.DOCKER_USERNAME }}',
          password: '${{ secrets.DOCKER_PASSWORD }}',
        },
      },
      {
        name: 'Build the Docker image',
        uses: 'docker/build-push-action@v2',
        with: {
          context: '.',
          file: './Dockerfile',
          platforms: 'linux/amd64,linux/arm64',
          push: false,
          tags: `${dockerHubOrg}/${dockerHubRepo}:latest`,
        },
      },
    ],
  },
});
publishDockerHub?.addJobs({
  publish_docker_hub: {
    runsOn: ['ubuntu-latest'],
    permissions: {},
    env: {
      CI: 'true',
    },
    steps: [
      {
        name: 'Check out the repo',
        uses: 'actions/checkout@v2',
      },
      {
        name: 'Set up QEMU',
        uses: 'docker/setup-qemu-action@v1',
      },
      {
        name: 'Set up Docker Buildx',
        uses: 'docker/setup-buildx-action@v1',
      },
      {
        name: 'Login to DockerHub',
        uses: 'docker/login-action@v1',
        with: {
          username: '${{ secrets.DOCKER_USERNAME }}',
          password: '${{ secrets.DOCKER_PASSWORD }}',
        },
      },
      {
        name: 'get_version',
        id: 'get_version',
        run: [
          'DVERSION=$(jq .version version.json -r)',
          'echo "::set-output name=dversion::$DVERSION"',
        ].join('\n'),
      },
      {
        name: 'Build and push',
        uses: 'docker/build-push-action@v2',
        with: {
          context: '.',
          file: './Dockerfile',
          platforms: 'linux/amd64,linux/arm64',
          push: true,
          tags: `${dockerHubOrg}/${dockerHubRepo}:\${{ steps.get_version.outputs.dversion }},${dockerHubOrg}/${dockerHubRepo}:latest`,
        },
      },
    ],
  },
});

project.synth();
