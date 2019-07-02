FROM ethereum/client-go:latest

WORKDIR /opt/

COPY conf/genesis.json conf/genesis.json

RUN geth --datadir /root/.ethereum/net42 init /opt/conf/genesis.json

EXPOSE 4242

ENTRYPOINT [ "/usr/local/bin/geth", "--datadir", "/root/.ethereum/net42", "--networkid", "42", "--rpc",  "--rpcaddr", "0.0.0.0", "--rpcport", "4242", "--nodiscover", "-gcmode", "archive", "--allow-insecure-unlock", "--rpcapi","eth,net,web3" ]