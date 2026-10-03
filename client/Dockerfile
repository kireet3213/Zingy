FROM instrumentisto/coturn

CMD ["turnserver", \
  "-n", \
  "--log-file=stdout", \
  "--lt-cred-mech", \
  "--user=devuser:devpass", \
  "--realm=localhost", \
  "--min-port=49160", \
  "--max-port=49200"]