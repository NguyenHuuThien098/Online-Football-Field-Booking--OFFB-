Start-Process powershell -ArgumentList "-NoExit","-Command","cd frontend; npm start; pause"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd Backend; npm run dev; pause"