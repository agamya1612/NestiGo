cd d:\NestiGo\services

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd order-service; node index.js"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd payment-service; node index.js"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd dispatch-service; node index.js"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd notification-service; node index.js"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd catalog-service; node index.js"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd user-service; node index.js"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd api-gateway; node index.js"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd websocket-service; node index.js"
