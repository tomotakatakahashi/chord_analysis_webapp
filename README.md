# Web Application to Analyze Chord Progression of Songs

- [Chord Fit](https://chord.fit/)

## Test locally
- Set up Ubuntu 18.04
- `sudo apt install python3 python3-pip libsndfile-dev ffmpeg`

```
git clone <this repository>
pip3 install gunicorn==19.9.0 Flask==1.1.1 librosa==0.7.0
pip3 install -U colorama
gunicorn app:app
```

See http://127.0.0.1:8000/ and upload a MP3 file.

## How to Deploy
```
BUCKET_NAME=`cat /dev/urandom| base64| tr -dc 'a-z'| fold -w 16| head -n 1`
ENV_SUFFIX=dev # or prod
aws s3 mb s3://${BUCKET_NAME}
aws cloudformation package \
    --template-file cloudformation_templates/eb.yml \
    --s3-bucket $BUCKET_NAME \
    --output-template-file packaged_templates/eb.yml
aws cloudformation deploy \
    --template-file packaged_templates/eb.yml \
    --stack-name chord-fit-${ENV_SUFFIX} \
    --parameter-override EnvSuffix=${ENV_SUFFIX} \
    --capabilities CAPABILITY_NAMED_IAM
aws s3 rm --recursive s3://${BUCKET_NAME}/
aws s3 rb s3://${BUCKET_NAME}
```

### DNS Settings for production environment
```
EB_ZONEID=Z1R25G3KIG2GBW # for APN1 region. See https://docs.aws.amazon.com/general/latest/gr/elasticbeanstalk.html
DOMAIN_NAME=chord.fit
CNAME=`aws elasticbeanstalk describe-environments| jq --raw-output ".Environments| map(select(.EnvironmentName == \"chord-fit-${ENV_SUFFIX}\"))| .[0].CNAME"`
aws cloudformation deploy \
    --template-file cloudformation_templates/dns.yml \
    --stack-name chord-fit-dns-${ENV_SUFFIX} \
    --parameter-override \
        EnvSuffix=${ENV_SUFFIX} \
        DomainName=$DOMAIN_NAME \
        EBCNAME=$CNAME \
        EBZoneID=${EB_ZONEID}
```

Set your domain's nameserver as followings.
```
DOMAIN_ZONEID=`aws route53 list-hosted-zones| jq --raw-output ".HostedZones| map(select(.Name == \"${DOMAIN_NAME}.\"))| .[0].Id"`
aws route53 get-hosted-zone --id ${DOMAIN_ZONEID}| jq --raw-output '.DelegationSet.NameServers'
```


## References
- [Fujishima, Takuya. Realtime Chord Recognition of Musical Sound: a System Using Common Lisp Music.](https://quod.lib.umich.edu/i/icmc/bbp2372.1999.446/--realtime-chord-recognition-of-musical-sound-a-system-using)
    - The approach which this utilize to recognize chords from music.
- [特開2000-298475](https://www.j-platpat.inpit.go.jp/c1800/PU/JP-2000-298475/DE702924E886509630C4BE1EC170643D2703BCAF24666387BCAF978160C604E0/11/ja)
    - Related patent in Japan, which seems expired.
