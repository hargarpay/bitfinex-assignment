
'use strict'
const { PeerRPCClient }  = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link');
const http = require('http');
const { responseAPI, addBodyToRequest, peerInPromise } = require('./helper');
const { simpleOrderMatchingEngine } = require('./service');

const clientID = process.argv[2];
const port = parseInt(process.argv[3]);
let orderBooks = [];

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init();

http.createServer(async (req, res) => {
    try{

    switch(req.method){
        case "POST":
            await addBodyToRequest(req);
            /**
             * @example 
             *  METHOD : POST
             *  URL: http://localhost:${port}/add-client
             *  BODY: {
             *      "orders": [
             *         {
             *              "price": 4500,
             *              "book": "ABC"
             *          },
             *          {
             *             "price": 7500,
             *              "book": "DEF"
             *          }
             *       ]
             *  }
             */
            if(req.url === "/submit-order"){
                const { orders } = req.body;

                await peerInPromise(
                    peer, 'submit_order', { currentClient:  clientID, orders}
                );

                orderBooks = orderBooks.concat(orders);

                responseAPI(res, 200, {
                    note: "Successfully submit order and broadcast to other clients"
                })
            }else{
                responseAPI(res, 404, {
                    note: `POST ${req.url} can not be found`
                })
            }
            break;

         case "GET":
             const queryObject = new URL(`http://localhost:${port}${req.url}`);

            if(queryObject.pathname === "/add-client"){
                await peerInPromise(
                    peer, 'add_client', { currentClient:  clientID}
                );

                responseAPI(res, 200, { note: "Successfully add client" });

            }else if(queryObject.pathname === "/broadcast-order"){
                const orderID = queryObject.searchParams.get("orderID");

                const { orders } = await peerInPromise(
                    peer, 'submit_order', { client:  clientID, orderID },
                );

                
                orderBooks = simpleOrderMatchingEngine(
                       orderBooks, orders
                );

                responseAPI(res, 200, {
                    note: "Successfully process order for other clients"
                })
            }else{
                responseAPI(res, 404, {
                    note: `GET ${req.url} can not be found`
                })
            }
        default:
            responseAPI(res, 404, {
                note: "HTTP verb is not support"
            })

        }
    
    }catch(error){
        console.log(error);
        responseAPI(res, 500, {
            note: "Sorry, we are currently fixing this issue"
        })

    }
}
).listen(port, () => {
    console.log(`Client running on port ${port}`)
})