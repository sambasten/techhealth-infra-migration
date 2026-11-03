import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as fs from 'fs';
import * as path from 'path';


export interface TechHealthEC2Props {
    vpc: ec2.Vpc;
}
export class TechHealthEC2 extends Construct {

  public readonly ec2securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: TechHealthEC2Props) {
    super(scope, id);

    //Ec2Security Group
    this.ec2securityGroup = new ec2.SecurityGroup(this, 'MigrationSecurityGroup', {
        vpc: props.vpc,
        description: 'Allow SSH, HTTP and HTTPS traffic',
        allowAllOutbound: true
    });
    this.ec2securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP Access');
    this.ec2securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS Access');

    //IAM role for EC2
    const ec2role = new iam.Role(this, 'ec2Role', {
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        });
    ec2role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    const userDataPath = fs.readFileSync(path.join(__dirname, '../bash-scripts/user-data.sh'), 'utf-8');
    
    //console.log(userDataPath);

    //attach EC2 to public subnet
    const publicEC2 = new ec2.Instance(this, 'PublicEC2', {
        vpc: props.vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
        machineImage: ec2.MachineImage.latestAmazonLinux2023(),
        vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC
        },
        securityGroup: this.ec2securityGroup,
        role: ec2role,
        userData: ec2.UserData.custom(userDataPath)
    });

    //output the EC2 web server URL after deploy
    new cdk.CfnOutput(this, 'PublicEC2Url', {
        value: `http://${publicEC2.instancePublicDnsName}`,
        description: 'Public URL of the TechHealth EC2 web server',
    });
  }
}