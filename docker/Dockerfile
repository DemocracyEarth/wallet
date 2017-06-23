FROM victorhundo/meteor

USER meteor
WORKDIR /app

EXPOSE 3000
COPY ./entrypoint.sh /
CMD [ "/bin/bash", "/entrypoint.sh"]
