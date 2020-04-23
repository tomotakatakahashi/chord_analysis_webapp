# Deploy Manual

## How to Deploy
```
BUCKET_NAME=`cat /dev/urandom| base64| tr -dc 'a-z'| fold -w 16| head -n 1`
ENV_SUFFIX=dev # or prod
EMAIL_ADDRESS=user@example.com # Replace this with yours
DOMAIN_NAME=chord.fit
CONFIG_SSL=false
aws s3 mb s3://${BUCKET_NAME}
aws cloudformation package \
    --template-file cloudformation_templates/main.yml \
    --s3-bucket $BUCKET_NAME \
    --output-template-file packaged_templates/main.yml
aws cloudformation deploy \
    --template-file packaged_templates/main.yml \
    --stack-name chord-fit-${ENV_SUFFIX} \
    --parameter-override EnvSuffix=${ENV_SUFFIX} \
    EmailAddress=$EMAIL_ADDRESS \
    ConfigSSL=$CONFIG_SSL \
    DomainName=$DOMAIN_NAME \
    --capabilities CAPABILITY_NAMED_IAM
```

### DNS Settings for production environment
```
ENV_SUFFIX=prod
EB_ZONEID=Z1R25G3KIG2GBW # for APN1 region. See https://docs.aws.amazon.com/general/latest/gr/elasticbeanstalk.html
CNAME=`aws elasticbeanstalk describe-environments| jq --raw-output ".Environments| map(select(.EnvironmentName == \"chord-fit-${ENV_SUFFIX}\"))| .[0].CNAME"`
aws cloudformation deploy \
    --template-file cloudformation_templates/dns.yml \
    --stack-name chord-fit-dns-prod \
    --parameter-override \
        EnvSuffix=prod \
        DomainName=$DOMAIN_NAME \
        EBCNAME=$CNAME \
        EBZoneID=${EB_ZONEID}
```

Set your domain's nameserver as followings.
```
DOMAIN_ZONEID=`aws route53 list-hosted-zones| jq --raw-output ".HostedZones| map(select(.Name == \"${DOMAIN_NAME}.\"))| .[0].Id"`
aws route53 get-hosted-zone --id ${DOMAIN_ZONEID}| jq --raw-output '.DelegationSet.NameServers'
```

Update SSL settings of Elastic Beanstalk.
```
CONFIG_SSL=true
aws cloudformation deploy \
    --template-file packaged_templates/main.yml \
    --stack-name chord-fit-${ENV_SUFFIX} \
    --parameter-override EnvSuffix=${ENV_SUFFIX} \
    EmailAddress=$EMAIL_ADDRESS \
    ConfigSSL=$CONFIG_SSL \
    DomainName=$DOMAIN_NAME \
    --capabilities CAPABILITY_NAMED_IAM
```

Cleanup:
```
aws s3 rm --recursive s3://${BUCKET_NAME}/
aws s3 rb s3://${BUCKET_NAME}
```
