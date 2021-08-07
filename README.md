# CDK Coded Infrastructure

`npm install -g typeorm ts-node`

## Getting started

```
export AWS_PROFILE=YOUR_PROFILE
export CDK_DEFAULT_REGION=YOUR_REGION
export CDK_DEFAULT_ACCOUNT=YOUR_ACCOUNT

export GITHUB_ORG=YOUR_GITHUB_ORG
export GITHUB_REPO=YOUR_GITHUB_REPO
export GITHUB_REPO=YOUR_GITHUB_BRANCH
```

1. Bootstrap CDK

```
cdk bootstrap aws://${CDK_DEFAULT_REGION}/${REGION} --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

2. Create RDS Password secret in Secrets Manager

```bash
aws secretsmanager create-secret --name rdsPassword --description "RDS Password" --secret-string YOUR_PASSWORD
```

3. Create Github Token secret in Secrets Manager

```bash
aws secretsmanager create-secret --name github-token --description "Secret for GitHub" --secret-string "GITHUB_PERSONAL_ACCESS_TOKEN"
```

4. Create a .env file `cp .env.example .env`

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
