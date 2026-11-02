import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';

export class TechhealthInfraMigrationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MigrationVpc', {
        cidr: '10.0.0.0/16',
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

    //Ec2Security Group
    const ec2securityGroup = new ec2.SecurityGroup(this, 'MigrationSecurityGroup', {
        vpc: vpc,
        description: 'Allow SSH, HTTP and HTTPS traffic',
        allowAllOutbound: true
    });
    ec2securityGroup.addIngressRule(ec2.Peer.ipv4('136.226.130.245/32'), ec2.Port.tcp(22), 'SSH Access');
    ec2securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP Access');
    ec2securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS Access');

    //RDS Security Group
    const rdssecurityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
        vpc: vpc,
        description: 'Allow MySQL traffic',
        allowAllOutbound: true
    });
    rdssecurityGroup.addIngressRule(ec2securityGroup, ec2.Port.tcp(3306), 'allow SQL access from ec2');

    //IAM role for EC2
    const ec2role = new iam.Role(this, 'ec2Role', {
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      });
    ec2role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    //attach EC2 to public subnet
    const publicEC2 = new ec2.Instance(this, 'PublicEC2', {
        vpc: vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
        machineImage: ec2.MachineImage.latestAmazonLinux2023(),
        vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC
        },
        securityGroup: ec2securityGroup,
        role: ec2role
    })

    //attch RDS to private subnet
    const rdsDB = new rds.DatabaseInstance(this, 'MigrationDB', {
        vpc: vpc,
        engine: rds.DatabaseInstanceEngine.mysql({
            version: rds.MysqlEngineVersion.VER_8_0_42,
        }),
        vpcSubnets: {
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        },
        securityGroups: [rdssecurityGroup],
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
        allocatedStorage: 20,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        storageEncrypted: true
    })

  }
}
