from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import incidents, units

# Create the FastAPI application instance
app = FastAPI(title="Dispatch AI API", version="0.1.0")

# Add CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only. Change for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A simple test route to see if the server is working
@app.get("/")
def read_root():
    return {"message": "Welcome to the Dispatch AI API Server!"}

# A test route to get a simple incident (We will change this later)
@app.get("/incidents/test")
def get_test_incident():
    """Returns a dummy incident for testing"""
    test_incident = {
        "id": 1,
        "type": "car accident",
        "location": "Main St & 5th Ave",
        "priority": "High"
    }
    return test_incident


# Mount API routers under /api/v1
app.include_router(incidents.router, prefix="/api/v1")
app.include_router(units.router, prefix="/api/v1")


# For direct execution (optional)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)