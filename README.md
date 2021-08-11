# Serverless Graphql API

Graphql API running on AWS Lambda in a custom VPC with RDS Postgres as a data source. All infrastructure is managed by the AWS CDK.

## Getting started

```
export AWS_PROFILE=YOUR_PROFILE
export CDK_DEFAULT_REGION=YOUR_REGION
export CDK_DEFAULT_ACCOUNT=YOUR_ACCOUNT
```

**Note**

Install `npm install -g typeorm ts-node typescript aws-cdk`

1. Git Fork this repo.

2. Bootstrap CDK

```
cdk bootstrap aws://${CDK_DEFAULT_ACCOUNT}/${CDK_DEFAULT_REGION} --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

3. Create RDS Password secret in SecretsManager

```bash
aws secretsmanager create-secret --name rdsPassword --description "RDS Password" --secret-string YOUR_PASSWORD >> rdsPasswordARN.txt
```

Save ARN for secret to be used later.

4. Create Github Token and store it as a secret in SecretsManager.

Follow this doc for setting up github webhook token https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token

After that save token in SecretsManger as a secure string

```bash
aws secretsmanager create-secret --name github-token --description "Secret for GitHub" --secret-string "GITHUB_PERSONAL_ACCESS_TOKEN" >> githubTokenARN.txt
```

5. Create a .env file `cp .env.example .env`

## Deploy Stack

1. Build the App to compile it from TS to JS. `npm run build:app`

2. Deploy all stacks `cdk deploy PipelineStack` The PipelineStack will deploy the other resources for you. (set `--profile YOURPROFILE` if you haven't ran `export AWS_PROFILE=YOUR_PROFILE`)

3. (optional) Deploy all stacks `cdk deploy --all`

**Note:**
You can also deploy single stacks at a time with `cdk deploy STACKNAME`

### **Note**

Currently there is a bug with the Service Role on CodeBuild and needs to be manually updated.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
