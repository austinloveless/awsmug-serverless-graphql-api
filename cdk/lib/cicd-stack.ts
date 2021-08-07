import { CfnOutput, Construct, Stack, StackProps, Aws } from "@aws-cdk/core";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "@aws-cdk/pipelines";

export interface PipelineStackProps extends StackProps {
  rdsPasswordSecretArn: string;
}

export class PipelineStack extends Stack {
  readonly pipelineStack: CodePipeline;

  readonly apiPath: CfnOutput;
  readonly rdsEndpoint: CfnOutput;
  readonly rdsUsername: CfnOutput;
  readonly rdsDatabase: CfnOutput;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const githubOrg = process.env.GITHUB_ORG || "austinloveless";
    const githubRepo =
      process.env.GITHUB_REPO || "awsmug-serverless-graphql-api";
    const githubBranch = process.env.GITHUB_REPO || "master";

    this.pipelineStack = new CodePipeline(this, "Pipeline", {
      pipelineName: "AWSMugPipeline",
      synth: new ShellStep("deploy", {
        input: CodePipelineSource.gitHub(
          `${githubOrg}/${githubRepo}`,
          githubBranch
        ),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
  }
}
