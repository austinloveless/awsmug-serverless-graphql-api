import { CfnOutput, Construct, Stack, SecretValue } from "@aws-cdk/core";
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline";
import {
  CodeBuildAction,
  GitHubSourceAction,
} from "@aws-cdk/aws-codepipeline-actions";
import {
  BuildSpec,
  EventAction,
  FilterGroup,
  LinuxBuildImage,
  Project,
  Source,
} from "@aws-cdk/aws-codebuild";

const githubOwner = process.env.GITHUB_ORG || "austinloveless";
const githubRepo = process.env.GITHUB_REPO || "awsmug-serverless-graphql-api";
const githubBranch = process.env.GITHUB_BRANCH || "master";

export class PipelineStack extends Stack {
  readonly pipeline: Pipeline;

  readonly apiPath: CfnOutput;
  readonly rdsEndpoint: CfnOutput;
  readonly rdsUsername: CfnOutput;
  readonly rdsDatabase: CfnOutput;

  constructor(scope: Construct, id: string, props?: {}) {
    super(scope, id, props);

    const gitHubSource = Source.gitHub({
      owner: githubOwner,
      repo: githubRepo,
      webhook: true,
      webhookFilters: [
        FilterGroup.inEventOf(EventAction.PUSH).andBranchIs("main"),
      ],
    });

    // CODEBUILD - project
    const project = new Project(this, "MyProject", {
      projectName: `${this.stackName}`,
      source: gitHubSource,
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_2,
        privileged: true,
      },
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              "cd app",
              "npm ci",
              "npm run build",
              "cd ../",
              "npm ci",
              "npm run cdk deploy APIStack",
            ],
          },
        },
      }),
    });

    // ***PIPELINE ACTIONS***
    const sourceOutput = new Artifact();
    const buildOutput = new Artifact();

    const sourceAction = new GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: githubOwner,
      repo: githubRepo,
      branch: githubBranch,
      oauthToken: SecretValue.secretsManager("github-token"),
      output: sourceOutput,
    });

    const buildAction = new CodeBuildAction({
      actionName: "CodeBuild",
      project: project,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    // PIPELINE STAGES

    this.pipeline = new Pipeline(this, "APIPipeline", {
      stages: [
        {
          stageName: "Source",
          actions: [sourceAction],
        },
        {
          stageName: "Build",
          actions: [buildAction],
        },
      ],
    });
  }
}
