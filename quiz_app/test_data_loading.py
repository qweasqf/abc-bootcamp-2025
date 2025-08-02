#!/usr/bin/env python3
"""
Test script to check if quiz data loads correctly
"""
import json
import os

def test_quiz_data():
    try:
        # Get the absolute path to the data file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, 'data', 'quiz_data.json')
        
        print(f"Looking for quiz data at: {data_path}")
        print(f"File exists: {os.path.exists(data_path)}")
        
        if not os.path.exists(data_path):
            print("❌ Quiz data file not found!")
            return False
            
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print("✅ Quiz data loaded successfully!")
        print(f"Categories found: {len(data.get('categories', {}))}")
        
        for category, questions in data.get('categories', {}).items():
            print(f"  - {category}: {len(questions)} questions")
            
        return True
        
    except FileNotFoundError:
        print("❌ Quiz data file not found!")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing quiz data JSON: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == '__main__':
    print("Testing quiz data loading...")
    print("=" * 40)
    success = test_quiz_data()
    print("=" * 40)
    if success:
        print("✅ All tests passed! Quiz data is ready.")
    else:
        print("❌ Tests failed. Please check the issues above.")
    
    input("\nPress Enter to exit...")
