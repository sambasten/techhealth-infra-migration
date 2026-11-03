#!/bin/bash

#install yum and httpd web server
sudo yum update -y
sudo yum install httpd -y
sudo systemctl start httpd
sudo systemctl enable httpd


#create and echo index.html file
echo "<h1> Tech Health Infrastructure Migration Complete! </h1>" >> /var/www/html/index.html