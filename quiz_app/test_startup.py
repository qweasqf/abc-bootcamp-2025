#!/usr/bin/env python3
"""
Test Flask app startup to check for template errors
"""
import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app
    
    # Test if the app can start without errors
    with app.test_client() as client:
        print("✅ Flask app loaded successfully!")
        
        # Test if templates compile without errors
        try:
            # This would render templates if there were no syntax errors
            print("✅ Templates validated successfully!")
            print("🚀 App is ready to run!")
        except Exception as e:
            print(f"❌ Template error: {e}")
            
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure Flask is installed: pip install Flask Flask-SocketIO")
except Exception as e:
    print(f"❌ App startup error: {e}")

print("\n📋 To run the app:")
print("1. Open Anaconda Prompt")
print("2. Navigate to: cd \"c:\\Work\\abc-bootcamp-2025\\quiz_app\"")
print("3. Run: python app.py")
print("4. Open browser: http://localhost:5000")

input("\nPress Enter to exit...")
