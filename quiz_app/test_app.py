#!/usr/bin/env python3
"""
Test script to run the quiz app
"""
import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the app
from app import app

if __name__ == '__main__':
    print("Starting Quiz App...")
    print("Open your browser to http://localhost:5000")
    app.run(debug=True, port=5000)
