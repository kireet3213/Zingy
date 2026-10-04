FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    coturn \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable coturn service config
RUN sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn || true

COPY turnserver.conf /etc/turnserver.conf

EXPOSE 3478/tcp 3478/udp 5349/tcp 5349/udp 49160-49200/udp

CMD ["turnserver", "-c", "/etc/turnserver.conf", "-n"]