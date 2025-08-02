#!/usr/bin/env python3
"""
Diagnostic script for Quiz App
"""
import sys
import os

def check_python_environment():
    print("🔍 Python Environment Check")
    print("-" * 30)
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    
    # Check if we're using Anaconda
    if 'anaconda' in sys.executable.lower() or 'conda' in sys.executable.lower():
        print("✅ Running with Anaconda Python")
    else:
        print("⚠️  Not running with Anaconda Python")
        print("   Consider using Anaconda Prompt and running:")
        print("   cd \"c:\\Work\\abc-bootcamp-2025\\quiz_app\"")
        print("   python app.py")
    
    print()

def check_required_packages():
    print("📦 Package Check")
    print("-" * 30)
    
    required_packages = ['flask', 'flask_socketio']
    all_good = True
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}: Installed")
        except ImportError:
            print(f"❌ {package}: NOT INSTALLED")
            all_good = False
    
    if not all_good:
        print("\n💡 To install missing packages:")
        print("pip install Flask Flask-SocketIO")
    
    print()

def check_files():
    print("📁 File Check")
    print("-" * 30)
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    required_files = [
        'app.py',
        'data/quiz_data.json',
        'templates/dashboard.html',
        'templates/solo_quiz.html',
        'static/js/solo_quiz.js',
        'static/css/style.css'
    ]
    
    all_files_exist = True
    for file_path in required_files:
        full_path = os.path.join(current_dir, file_path)
        if os.path.exists(full_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - MISSING")
            all_files_exist = False
    
    print()
    return all_files_exist

def main():
    print("🏥 Quiz App Diagnostic Tool")
    print("=" * 50)
    print()
    
    check_python_environment()
    check_required_packages()
    files_ok = check_files()
    
    print("📋 Summary")
    print("-" * 30)
    if files_ok:
        print("✅ All required files are present")
        print("🚀 You can try running: python app.py")
    else:
        print("❌ Some files are missing")
        print("💡 Please check the file structure")
    
    print("\n💭 If you still have issues:")
    print("1. Make sure you're using Anaconda Prompt")
    print("2. Navigate to the quiz_app folder")
    print("3. Run: python test_data_loading.py")
    print("4. Then run: python app.py")

if __name__ == '__main__':
    main()
    input("\nPress Enter to exit...")
