#!/usr/bin/env python3
"""
DevCompare Setup Test Script
Verifies that all components are properly configured
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists"""
    if os.path.exists(file_path):
        print(f"[PASS] {description}: {file_path}")
        return True
    else:
        print(f"[FAIL] {description}: {file_path} (NOT FOUND)")
        return False

def check_directory_structure():
    """Check if all required directories exist"""
    print("Checking directory structure...")
    
    required_dirs = [
        "mobile/src/components",
        "mobile/src/screens", 
        "mobile/src/navigation",
        "mobile/src/services",
        "mobile/src/stores",
        "mobile/src/types",
        "mobile/src/theme",
        "scrapers",
        "docs",
        ".github/workflows"
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        if os.path.exists(dir_path):
            print(f"[PASS] Directory: {dir_path}")
        else:
            print(f"[FAIL] Directory: {dir_path} (NOT FOUND)")
            all_exist = False
    
    return all_exist

def check_mobile_files():
    """Check if all mobile app files exist"""
    print("\nChecking mobile app files...")
    
    mobile_files = [
        ("mobile/package.json", "Package.json"),
        ("mobile/app.json", "App configuration"),
        ("mobile/App.tsx", "Main App component"),
        ("mobile/src/types/index.ts", "TypeScript types"),
        ("mobile/src/theme/index.ts", "Theme configuration"),
        ("mobile/src/services/supabase.ts", "Supabase service"),
        ("mobile/src/stores/index.ts", "Zustand stores"),
        ("mobile/src/navigation/AppNavigator.tsx", "Navigation setup"),
        ("mobile/src/screens/AuthScreen.tsx", "Auth screen"),
        ("mobile/src/screens/FeedScreen.tsx", "Feed screen"),
        ("mobile/src/screens/SavedScreen.tsx", "Saved screen"),
        ("mobile/src/components/HackathonCard.tsx", "Hackathon card component"),
        ("mobile/.env.example", "Environment template"),
    ]
    
    all_exist = True
    for file_path, description in mobile_files:
        if not check_file_exists(file_path, description):
            all_exist = False
    
    return all_exist

def check_scraper_files():
    """Check if all scraper files exist"""
    print("\nChecking scraper files...")
    
    scraper_files = [
        ("scrapers/requirements.txt", "Python requirements"),
        ("scrapers/unstop_scraper.py", "Unstop scraper"),
        ("scrapers/devpost_scraper.py", "Devpost scraper"),
        ("scrapers/.env.example", "Scraper environment template"),
    ]
    
    all_exist = True
    for file_path, description in scraper_files:
        if not check_file_exists(file_path, description):
            all_exist = False
    
    return all_exist

def check_documentation():
    """Check if documentation files exist"""
    print("\nChecking documentation...")
    
    doc_files = [
        ("README.md", "Main README"),
        ("docs/schema.sql", "Database schema"),
        ("docs/SETUP.md", "Setup guide"),
        ("docs/ROADMAP.md", "Development roadmap"),
        (".github/workflows/scrape.yml", "GitHub Actions workflow"),
    ]
    
    all_exist = True
    for file_path, description in doc_files:
        if not check_file_exists(file_path, description):
            all_exist = False
    
    return all_exist

def check_mobile_dependencies():
    """Check if mobile dependencies are installed"""
    print("\nChecking mobile dependencies...")
    
    try:
        if os.path.exists("mobile/node_modules"):
            print("[PASS] Node modules installed")
            return True
        else:
            print("[FAIL] Node modules not installed (run 'npm install' in mobile directory)")
            return False
    except Exception as e:
        print(f"[FAIL] Error checking dependencies: {e}")
        return False

def check_app_config():
    """Check app.json configuration"""
    print("\nChecking app configuration...")
    
    try:
        with open("mobile/app.json", "r") as f:
            config = json.load(f)
        
        expo_config = config.get("expo", {})
        
        if expo_config.get("name") == "DevCompare":
            print("[PASS] App name configured correctly")
        else:
            print("[FAIL] App name not set to 'DevCompare'")
            return False
        
        if expo_config.get("slug") == "devcompare":
            print("[PASS] App slug configured correctly")
        else:
            print("[FAIL] App slug not set to 'devcompare'")
            return False
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Error checking app config: {e}")
        return False

def main():
    """Main test function"""
    print("DevCompare Setup Verification")
    print("=" * 40)
    
    # Change to project root directory
    os.chdir(Path(__file__).parent)
    
    tests = [
        ("Directory Structure", check_directory_structure),
        ("Mobile App Files", check_mobile_files),
        ("Scraper Files", check_scraper_files),
        ("Documentation", check_documentation),
        ("Mobile Dependencies", check_mobile_dependencies),
        ("App Configuration", check_app_config),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Error running {test_name}: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 40)
    print("SUMMARY")
    print("=" * 40)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\nAll tests passed! Your DevCompare setup is ready.")
        print("\nNext steps:")
        print("1. Set up Supabase project and update .env files")
        print("2. Run 'npm start' in mobile directory")
        print("3. Test the app on your device")
    else:
        print(f"\n{total - passed} tests failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()