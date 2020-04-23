#!/bin/bash

if [ "$CONFIG_SSL" = "true" ]; then
    yum remove --assumeyes epel-release.noarch
    (
        (yum install --assumeyes https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm) &&
        (yum install --assumeyes certbot python2-certbot-nginx) &&
        (certbot --non-interactive --nginx --agree-tos --domain $DOMAIN_NAME --keep-until-expiring --redirect --no-eff-email --email $EMAIL_ADDRESS) &&
        (echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null)
    )
fi
