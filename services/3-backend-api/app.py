# services/3-backend-api/app.py
from fastapi import FastAPI, Request
import logging

app = FastAPI()
logging.basicConfig(level=logging.INFO)

@app.get("/")
def health_check():
    return {"status": "Backend is running and isolated."}

@app.get("/confidential")
def get_secure_data(request: Request):
    # Notice: There is NO authentication logic here. 
    # This service is entirely dependent on the API Gateway blocking bad traffic 
    # before it ever reaches this network segment.
    client_ip = request.client.host
    logging.info(f"Fulfilling secure data request. Proxied from: {client_ip}")
    
    return {
        "message": "Success! You have breached the outer perimeter securely.",
        "data": {
            "project_codename": "Human Identity Vault",
            "security_clearance": "Top Secret",
            "active_threats": 0
        }
    }