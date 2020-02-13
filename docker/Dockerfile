FROM victorhundo/meteor

ARG USER_ID
ARG GROUP_ID

RUN usermod -u $USER_ID meteor && groupmod -g $USER_ID meteor
USER meteor
WORKDIR /app

EXPOSE 3000
COPY ./entrypoint.sh /
CMD [ "/bin/bash", "/entrypoint.sh"]
