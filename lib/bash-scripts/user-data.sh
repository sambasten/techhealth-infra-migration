#!/bin/bash

#install yum and httpd web server
yum update -y
yum install httpd -y
systemctl start httpd
systemctl enable httpd

#install mysql client
yum install mariadb105 -y

#create and echo index.html file
echo "<h1> Tech Health Infrastructure Migration Complete! </h1>" >> /var/www/html/index.html