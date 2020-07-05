#!/bin/bash

if [ "$CONFIG_SSL" = "true" ]; then
    (
        (wget -r --no-parent -A 'epel-release-*.rpm' http://dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/) &&
        (rpm -Uvh dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/epel-release-*.rpm) &&
        (yum-config-manager --enable epel*) &&
        (yum install --assumeyes certbot python2-certbot-nginx) &&
        (certbot --non-interactive --nginx --agree-tos --domain $DOMAIN_NAME --keep-until-expiring --redirect --no-eff-email --email $EMAIL_ADDRESS) &&
        (echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null)
    )
fi
