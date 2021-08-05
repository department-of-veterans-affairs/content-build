FROM amazonlinux:1
USER root

ENV NODE_ENV production
ENV DRUPAL_ADDRESS https://cms-vets-website-branch-builds-lo9uhqj18nwixunsjadvjsynuni7kk1u.ci.cms.va.gov
# What should we have as default?
ENV BUILDTYPE localhost


RUN yum update -y && \
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash && \
  . ~/.nvm/nvm.sh && \
  nvm install 14.15.0 && \
  npm i -g yarn@1.21.1

COPY ../.. /content-build/
# COPY ../../../vagov-content /vagov-content
# COPY /usr/local/share/ca-certificates/VA-Internal-S2-RCA1-v1.cer.crt /usr/local/share/ca-certificates/VA-Internal-S2-RCA1-v1.cer.crt 

WORKDIR /content-build

CMD yarn install
CMD NODE_ENV=${ NODE_ENV } yarn build --buildtype=${ BUILDTYPE } --asset-source=local --drupal-address=${{ DRUPAL_ADDRESS }} --pull-drupal --drupal-max-parallel-requests=15 --no-drupal-proxy --verbose

# TODO: Get output of /content-build/build
