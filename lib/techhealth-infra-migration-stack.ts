import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { TechHealthEC2 } from './modules/techhealth-ec2';
import { TechHealthRDS } from './modules/techhealth-rds';

export class TechHealthInfraMigrationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MigrationVpc', {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        maxAzs: 2,
        subnetConfiguration: [
            {
                cidrMask: 24,
                name: 'Public',
                subnetType: ec2.SubnetType.PUBLIC,
            },
            {
                cidrMask: 24,
                name: 'Private',
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
        ],
    });
    cdk.Tags.of(vpc).add('Name', 'MigrationVpc');

    const publicEC2 = new TechHealthEC2(this, 'TechHealthEC2', {
        vpc: vpc,
    });
    cdk.Tags.of(publicEC2).add('Name', 'Public EC2');

    const rdsEC2 = new TechHealthRDS(this, 'TechHealthRDS', {
        vpc: vpc,
        ec2securityGroup: publicEC2.ec2securityGroup
    });
    cdk.Tags.of(rdsEC2).add('Name', 'Private RDS Database');

    new cdk.CfnOutput(this, 'PublicEC2Url', {
        value: publicEC2.outputEC2Url.value,
        description: 'Public URL of the TechHealth EC2 web server',
    })

  }
}
