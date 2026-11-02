import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

export interface TechHealthRDSProps {
    vpc: ec2.Vpc;
    ec2securityGroup: ec2.SecurityGroup
}
export class TechHealthRDS extends Construct {
  constructor(scope: Construct, id: string, props: TechHealthRDSProps) {
    super(scope, id);

    //RDS Security Group
    const rdssecurityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
        vpc: props.vpc,
        description: 'Allow MySQL traffic from ec2',
        allowAllOutbound: true
    });
    rdssecurityGroup.addIngressRule(props.ec2securityGroup, ec2.Port.tcp(3306), 'allow SQL access from ec2');


    //attch RDS to private subnet
    const privateRDS = new rds.DatabaseInstance(this, 'MigrationDB', {
        vpc: props.vpc,
        engine: rds.DatabaseInstanceEngine.mysql({
            version: rds.MysqlEngineVersion.VER_8_4_10,
        }),
        vpcSubnets: {
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        },
        securityGroups: [rdssecurityGroup],
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
        allocatedStorage: 20,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        storageEncrypted: true
    });
  }
}