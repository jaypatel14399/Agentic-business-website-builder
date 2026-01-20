"""Manual test script for Google Places service.

This script tests the Google Places service with real API calls.
Requires a valid .env file with GOOGLE_PLACES_API_KEY set.
"""

import os
import sys
from pathlib import Path

# Add src to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from src.utils.config import get_config
from src.services.google_places import GooglePlacesService


def main():
    """Run manual tests against real Google Places API."""
    print("=" * 80)
    print("Google Places Service - Manual Test")
    print("=" * 80)
    print()
    
    # Check for API key
    try:
        config = get_config()
    except ValueError as e:
        print(f"[ERROR] Configuration Error: {e}")
        print("\nPlease ensure you have a .env file with GOOGLE_PLACES_API_KEY set.")
        return 1
    
    if not config.google_places_api_key:
        print("[ERROR] GOOGLE_PLACES_API_KEY is not set in .env file")
        return 1
    
    print(f"[OK] Configuration loaded successfully")
    print(f"  - API Key: {'*' * 20}...{config.google_places_api_key[-4:]}")
    print(f"  - Max Results: {config.google_places_max_results}")
    print()
    
    # Initialize service
    try:
        service = GooglePlacesService(config)
        print("[OK] Google Places Service initialized")
        print()
    except Exception as e:
        print(f"[ERROR] Failed to initialize service: {e}")
        return 1
    
    # Test search
    industry = "roofing"
    city = "Austin"
    state = "TX"
    
    print(f"Searching for: {industry} in {city}, {state}")
    print("-" * 80)
    print()
    
    try:
        businesses = service.search_businesses(industry, city, state)
        
        print(f"[OK] Search completed successfully")
        print(f"  Found {len(businesses)} businesses")
        print()
        
        if not businesses:
            print("[WARNING] No businesses found. This could be normal if:")
            print("  - The search query doesn't match any businesses")
            print("  - API quota has been exceeded")
            print("  - There's a network issue")
            return 0
        
        # Display results
        print("=" * 80)
        print("BUSINESS RESULTS")
        print("=" * 80)
        print()
        
        for idx, business in enumerate(businesses, 1):
            print(f"Business #{idx}")
            print("-" * 80)
            print(f"  Name:           {business.name}")
            print(f"  Address:        {business.address}")
            print(f"  Phone:          {business.phone or 'N/A'}")
            print(f"  Website:        {business.website_url or 'N/A'}")
            print(f"  Rating:         {business.rating or 'N/A'}")
            print(f"  Place ID:       {business.google_place_id}")
            print(f"  Industry:       {business.industry}")
            print(f"  Location:       {business.city}, {business.state}")
            print(f"  Coordinates:    ({business.latitude}, {business.longitude})" 
                  if business.latitude and business.longitude else "  Coordinates:    N/A")
            print(f"  Status:         {business.business_status or 'N/A'}")
            print(f"  Price Level:    {business.price_level or 'N/A'}")
            print(f"  Types:          {', '.join(business.types) if business.types else 'N/A'}")
            print(f"  Reviews:        {len(business.reviews)} review(s)")
            if business.reviews:
                print("    Recent reviews:")
                for review in business.reviews[:3]:  # Show first 3
                    author = review.get('author_name', 'Anonymous')
                    rating = review.get('rating', 'N/A')
                    text = review.get('text', '')[:100]  # First 100 chars
                    print(f"      - {author} ({rating}/5): {text}...")
            print(f"  Has Website:    {business.has_website}")
            print()
        
        print("=" * 80)
        print("[OK] Manual test completed successfully!")
        print("=" * 80)
        
        return 0
        
    except Exception as e:
        print(f"[ERROR] Error during search: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
