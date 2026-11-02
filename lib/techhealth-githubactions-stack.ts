import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class TechHealthGithubActionsOIDCStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Create IAM role for Github identity provider in this repo and add github identity provider arn
    const TechHealthGithubActionsIAMRole = new iam.Role(this, 'TechHealthGithubActionsIAMRole', {
        assumedBy: new iam.WebIdentityPrincipal('arn:aws:iam::045283898962:oidc-provider/token.actions.githubusercontent.com',
            {
                StringEquals: { 
                    'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                },
                StringLike: {
                    'token.actions.githubusercontent.com:sub': 'repo:sambasten@20877484/techhealth-infra-migration@1443247700',
                }
            }
        ),
        roleName: 'TechHealthGithubActionsIAMRole',
        description: 'Role for Github',
        inlinePolicies: {
            'TechHealthGithubActionsPolicy': new iam.PolicyDocument({
                statements: [
                    //deploy-stack job
                    new iam.PolicyStatement({
                        actions: ['sts:AssumeRole'],
                        resources: ['arn:aws:iam::045283898962:role/cdk-*'],
                    }),
                ]
            })
        }
    });
    cdk.Tags.of(TechHealthGithubActionsIAMRole).add('Name', 'TechHealthGithubActionsIAMRole');
  }
}