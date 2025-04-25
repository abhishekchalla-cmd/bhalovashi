echo "Building\n\n"
cd apps/frontend && yarn build
echo  "\n\nCopying files\n\n"
AWS_PROFILE='personal' aws s3 cp --recursive ./out s3://bhalovashi.abhishekchalla.in --acl public-read