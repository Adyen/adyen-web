FROM acr1-am4o.is.adyen.com/containers/nodejs-20-o9-image:latest
COPY . /home/user/workspace

ARG PYTHON="python3.11"

# Add Development Tools, Python and node source code for node-gyp compilation
RUN dnf groupinstall 'Development Tools' -y && \
    dnf install ${PYTHON} ${PYTHON}-pip make -y && \
    pip3.11 install --upgrade pip && \
    dnf install nodejs-devel -y


ARG HOME_DIR="/home/user"

USER user
WORKDIR $HOME_DIR

RUN npm install yarn@1.22.21 -g

# Include global NPM bin dir on path to be able to execute global packages like yarn.
ENV PATH="$HOME_DIR/local/bin:${PATH}"

# https://github.com/yarnpkg/yarn/issues/3728#issuecomment-1737249792
# Applying this for now, hopefully can be removed when upgrading to Yarn 3
RUN yarn global add node-gyp@10.0.1
