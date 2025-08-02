#!/usr/bin/env python3
"""
Check question counts in quiz data
"""
import json
import os

def count_questions():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, 'data', 'quiz_data.json')
        
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print("📊 Question Count Analysis")
        print("=" * 40)
        
        total_questions = 0
        for category, questions in data.get('categories', {}).items():
            count = len(questions)
            total_questions += count
            print(f"{category}: {count} questions")
            
        print("=" * 40)
        print(f"Total questions: {total_questions}")
        
        # Test scenario: all categories selected, 20 questions requested
        print("\n🧪 Test: All categories, 20 questions")
        all_questions = []
        for category, questions in data.get('categories', {}).items():
            for question in questions:
                question_copy = question.copy()
                question_copy['category'] = category
                all_questions.append(question_copy)
        
        max_questions = min(20, 20, len(all_questions))
        print(f"Available questions: {len(all_questions)}")
        print(f"Requested: 20")
        print(f"Max questions calculated: {max_questions}")
        
        if max_questions == 20:
            print("✅ Should return 20 questions")
        else:
            print(f"❌ Will only return {max_questions} questions")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    count_questions()
    input("\nPress Enter to exit...")
