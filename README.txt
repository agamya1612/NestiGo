so after having worked on nestigo for a while now, ive created this massive beast of a backend, modified a ton of the original architecture, and completely discarded the idea of keeping it simple. this is the result of the days ive given to this project, just sitting here grinding out microservices until my eyes bled.

honestly i didnt think it would get this big. it started off as a standard monolithic idea, but then i thought, screw it, let's go full enterprise. so now we are sitting on a 14-microservice architecture. yes, 14. 

ive got an api-gateway taking in all the traffic, verifying jwt tokens from supabase gotrue, and proxying it everywhere. then there's the order-service handling the core stuff, interacting with the pricing-service for surge multipliers and coupons. ive built a dispatch-service that literally uses redis geospatial queries to find the nearest workers, sort of like uber. there's a payment-service doing razorpay webhooks and handling commissions, a ledger-service for digital wallets, a kyc-service for provider document verification, a review-service... it just keeps going. i even built a chat-service using websockets so customers and workers can talk, and an audit-service that just sits there listening to every single kafka event and recording it like a black box flight recorder. 

speaking of kafka, that was a whole nightmare to set up, but it's the absolute backbone of this thing. i scrapped synchronous http calls between services because they kept timing out or causing cascading failures. instead, ive implemented full saga choreography. if a payment fails or a customer cancels, an event hits the bus, and the payment-service rolls back the transaction, the ledger-service credits the wallet, and the websocket-service pushes a live notification to the frontend. it's completely async and decoupled.

i spent the last few days just tuning the hell out of this infrastructure. the database kept bottlenecking when i hit it with load, so i had to dig into the postgres config and crank max_connections up to 1000. i also had to rewrite the proxy agent in the gateway to reuse tcp connections (keep-alive) because i was literally exhausting all my sockets and getting 504 gateway timeouts. 

to prove to myself that i wasn't crazy, i wrote a hardcore grafana k6 script and bombarded my own local machine with 1,000 concurrent virtual users. the result? 0.00% http 5xx error rate. the cluster ate 7,300+ requests without dropping a single saga flow. 

ive discarded sleep, ive modified my entire approach to backend engineering, and ive created something that is probably way too over-engineered for a home services app, but man, it works flawlessly. if you're trying to boot this up, you better have docker installed and some decent ram, because running postgres, redis, kafka, zookeeper, gotrue, and 14 node apps simultaneously on a single dev machine is heavy. 

just run `docker compose -f docker-compose.prod.yml up -d` and pray your fan doesn't take off. 

im going to get some coffee.
