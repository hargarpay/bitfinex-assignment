
'use strict'

const { PeerRPCServer }  = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link');
const { httpGET } = require("./helper");

const allClients = [];

// On Productions: it can save to redis
const unbroadcastedOrders = {};

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start();

const peer = new PeerRPCServer(link, {
  timeout: 300000
})
peer.init()

const port = 2024 + Math.floor(Math.random() * 1000)
const service = peer.transport('server')
service.listen(port)

setInterval(function () {
  link.announce('add_client', service.port, {});
  link.announce('submit_order', service.port, {});
}, 1000)

service.on('request', async (rid, key, payload, handler) => {
  switch(key){
      case "add_client":{
            const { currentClient, port } = payload;
            if(allClients.indexOf(currentClient) === -1) {
                    allClients.push({client: currentClient, port})
            }
                handler.reply(null, { msg: 'Add Client successfully' })
            }
          break;
      case "submit_order": {

            const { currentClient, orders } = payload;

            const allClientsProcessOrder = [];
            const broadcastClients = [];

            allClients.forEach(
            (clientProps) => {
                if(currentClient !== clientProps.client){
                    link.announce('broadcast_order', service.port, {});

                    const url = `http://localhost:${clientProps.port}/broadcast-order?orderID=${rid}`;
                    allClientsProcessOrder.push(httpGET(url));
                    broadcastClients.push(clientProps.client);
                }
            })
            unbroadcastedOrders[rid] = {orders, broadcastClients};

            if(unbroadcastedOrder.length > 0){
                await Promise.all(unbroadcastedOrders);
                handler.reply(null, { msg: 'Order broadcasted' });
            }else{
                handler.reply(null, { msg: 'No client has been added' });
            }
        }
      break;
      
      case "broadcast_order":
          const { client: processClient, orderID } = payload;
              let {orders, broadcastClients} = unbroadcastedOrders[orderID];

              broadcastClients = broadcastClients.filter(
                  client => client !== processClient
              );

              unbroadcastedOrders[orderID].broadcastClients = [...broadcastClients];

              if(unbroadcastedOrders[orderID].broadcastClients.length === 0){
                  delete unbroadcastedOrders[orderID];
              }
              
              handler.reply(null, { orders, msg: `Order broadcasted to ${client}` });
          break;
      default:
  }
})