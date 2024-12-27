Start-Process cmd -ArgumentList "/K","cd frontend && npm start && pause"
Start-Process cmd -ArgumentList "/K","cd Backend && npm run dev && pause"