#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { TechHealthGithubActionsOIDCStack } from '../lib/techhealth-githubactions-stack';

const app = new cdk.App();
new TechHealthGithubActionsOIDCStack(app, 'TechHealthGithubActionsOIDCStack');
