require("dotenv").config();
import { CfnOutput, Construct, Stack, StackProps } from "@aws-cdk/core";
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline";
import {
  CodeBuildAction,
  GitHubSourceAction,
} from "@aws-cdk/aws-codepipeline-actions";
import { BuildSpec, LinuxBuildImage, Project } from "@aws-cdk/aws-codebuild";
import { ISecret, Secret } from "@aws-cdk/aws-secretsmanager";

const githubOwner = process.env.GITHUB_OWNER || "austinloveless";
const githubRepo = process.env.GITHUB_REPO || "awsmug-serverless-graphql-api";
const githubBranch = process.env.GITHUB_BRANCH || "master";

export interface PipelineStackProps extends StackProps {
  githubWebhookToken: string;
}

export class PipelineStack extends Stack {
  readonly pipeline: Pipeline;
  readonly apiPath: CfnOutput;
  readonly rdsEndpoint: CfnOutput;
  readonly rdsUsername: CfnOutput;
  readonly rdsDatabase: CfnOutput;
  readonly secret: ISecret;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    this.secret = Secret.fromSecretAttributes(this, "rdsPassword", {
      secretArn: props.githubWebhookToken,
    });

    // CODEBUILD - project
    const project = new Project(this, "CodeBuildProject", {
      projectName: `${this.stackName}`,
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_2,
        privileged: true,
      },
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: ["npm ci", "npm run build:app", "npm run cdk synth"],
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
      oauthToken: this.secret.secretValue,
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
