import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';


export interface TechHealthEC2Props {
    vpc: ec2.Vpc;
}
export class TechHealthEC2 extends Construct {
  constructor(scope: Construct, id: string, props: TechHealthEC2Props) {
    super(scope, id);


    //Ec2Security Group
    const ec2securityGroup = new ec2.SecurityGroup(this, 'MigrationSecurityGroup', {
        vpc: props.vpc,
        description: 'Allow SSH, HTTP and HTTPS traffic',
        allowAllOutbound: true
    });
    ec2securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH Access');
    ec2securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP Access');
    ec2securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS Access');

    //IAM role for EC2
    const ec2role = new iam.Role(this, 'ec2Role', {
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        });
    ec2role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    //attach EC2 to public subnet
    const publicEC2 = new ec2.Instance(this, 'PublicEC2', {
        vpc: props.vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
        machineImage: ec2.MachineImage.latestAmazonLinux2023(),
        vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC
        },
       securityGroup: ec2securityGroup,
        role: ec2role
    })
  }
}