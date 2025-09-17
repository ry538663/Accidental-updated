from ..models import PriorityLevel

def predict_priority(incident_type: str, location: str, description: str = None) -> PriorityLevel:
    """
    A simple rule-based priority predictor.
    In a real application, this would be a trained machine learning model.
    """
    incident_type = incident_type.lower()
    description = (description or "").lower()
    
    # Critical incidents
    critical_keywords = ["fire", "explosion", "shooting", "terrorism", "hostage", "active shooter"]
    if any(keyword in incident_type or keyword in description for keyword in critical_keywords):
        return PriorityLevel.CRITICAL
    
    # High priority incidents
    high_keywords = ["accident", "crash", "heart attack", "stroke", "robbery", "assault"]
    if any(keyword in incident_type or keyword in description for keyword in high_keywords):
        return PriorityLevel.HIGH
    
    # Medium priority incidents
    medium_keywords = ["theft", "burglary", "injury", "fall", "allergy", "breathing"]
    if any(keyword in incident_type or keyword in description for keyword in medium_keywords):
        return PriorityLevel.MEDIUM
    
    # Default to low priority
    return PriorityLevel.LOW