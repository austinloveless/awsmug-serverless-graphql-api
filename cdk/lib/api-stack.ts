import { Stack, StackProps, Construct, CfnOutput } from "@aws-cdk/core";
import { LambdaRestApi, ResourceBase, RestApi } from "@aws-cdk/aws-apigateway";
import { Function, Runtime, Code } from "@aws-cdk/aws-lambda";
import { Vpc, SecurityGroup, SubnetType } from "@aws-cdk/aws-ec2";
import { ISecret, Secret } from "@aws-cdk/aws-secretsmanager";

export interface LambdaStackProps extends StackProps {
  vpc: Vpc;
  inboundDbAccessSecurityGroup: string;
  rdsEndpoint: string;
  rdsDbUser: string;
  rdsDbName: string;
  rdsPort: number;
  rdsPasswordSecretArn: string;
}

export class GraphqlApiStack extends Stack {
  readonly handler: any;
  readonly secret: ISecret;
  readonly api: RestApi;
  readonly apiPathOutput: CfnOutput;
  readonly graphql: ResourceBase;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.secret = Secret.fromSecretAttributes(this, "rdsPassword", {
      secretArn: props.rdsPasswordSecretArn,
    });

    this.handler = new Function(this, "graphql", {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("app"),
      handler: "build/src/graphql.handler",
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.ISOLATED,
      },
      securityGroup: SecurityGroup.fromSecurityGroupId(
        this,
        "inboundDbAccessSecurityGroup" + "rdsLambda",
        props.inboundDbAccessSecurityGroup
      ),

      environment: {
        TYPEORM_URL: `postgres://${
          props.rdsDbUser
        }:${this.secret.secretValue.toString()}@${props.rdsEndpoint}:${
          props.rdsPort
        }/${props.rdsDbName}`,
        TYPEORM_SYNCHRONIZE: "true",
        TYPEORM_LOGGING: "true",
        TYPEORM_ENTITIES: "./build/src/entity/*.entity.js",
      },
    });

    this.api = new LambdaRestApi(this, "graphql-api", {
      handler: this.handler,
      proxy: false,
    });

    this.graphql = this.api.root.addResource("graphql");
    this.graphql.addMethod("ANY");

    this.apiPathOutput = new CfnOutput(this, "apiPath", {
      value: this.api.root.path,
      description: "Path of the API",
    });
  }
}
