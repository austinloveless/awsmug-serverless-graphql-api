#!/usr/bin/env node
import "source-map-support/register";
import { App, Aws } from "@aws-cdk/core";

import { GraphqlApiStack } from "../lib/api-stack";
import { VpcStack } from "../lib/vpc-stack";
import { RDSStack } from "../lib/rds-stack";
import { PipelineStack } from "../lib/cicd-stack";

const app = new App();

const vpcStack = new VpcStack(app, "VPCStack");

// RDS Postgres
const rdsStack = new RDSStack(app, "RDSStack", {
  vpc: vpcStack.vpc,
  securityGroup: vpcStack.ingressSecurityGroup,
});

// Serverless Lambda/API Gateway Graphql API
new GraphqlApiStack(app, "APIStack", {
  vpc: vpcStack.vpc,
  inboundDbAccessSecurityGroup:
    rdsStack.postgresRDSInstance.connections.securityGroups[0].securityGroupId,
  rdsEndpoint: rdsStack.postgresRDSInstance.dbInstanceEndpointAddress,
  rdsDbUser: rdsStack.rdsDbUser,
  rdsDbName: rdsStack.rdsDbName,
  rdsPort: rdsStack.rdsPort,
});

// CodePipeline/CodeBuild for CI/CD
new PipelineStack(app, "PipelineStack");
