#!/usr/bin/env python3
"""
Knowledge Base Fix Script
========================
Replaces WRONG book.txt content with CORRECT content from docs/ folder

Problem: backend/book.txt contains outdated "Humanoid Robotics" book
Solution: Extract correct "Physical AI & Humanoid Robotics" content from docs/

Author: Claude (Anthropic)
Date: 2025-12-16
"""

import os
import re
import subprocess
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent
DOCS_DIR = PROJECT_ROOT / "docs"
BOOK_TXT_PATH = PROJECT_ROOT / "backend" / "book.txt"
INGEST_SCRIPT = PROJECT_ROOT / "backend" / "ingest.py"

# Chapter order
CHAPTERS = [
    "chapter-01",  # Introduction to Physical AI
    "chapter-02",  # ROS 2 Fundamentals
    "chapter-03",  # Digital Twin Simulation
    "chapter-04",  # NVIDIA Isaac Platform
    "chapter-05",  # Vision-Language-Action Models
    "chapter-06",  # Humanoid Robot Development
    "chapter-07",  # Conversational Robotics
    "chapter-08",  # Capstone Project
]


def clean_markdown_frontmatter(content: str) -> str:
    """Remove YAML frontmatter from markdown files"""
    # Remove frontmatter between --- markers
    content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)
    return content.strip()


def extract_chapter_content(chapter_folder: str) -> str:
    """Extract content from a chapter's index.md file"""
    chapter_path = DOCS_DIR / chapter_folder / "index.md"

    if not chapter_path.exists():
        print(f"[!] WARNING: {chapter_path} not found, skipping...")
        return ""

    print(f"[*] Reading: {chapter_folder}/index.md")

    with open(chapter_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove frontmatter
    content = clean_markdown_frontmatter(content)

    return content


def build_book_content() -> str:
    """Build complete book content from all chapters"""
    print("\n" + "="*70)
    print("BUILDING CORRECT BOOK CONTENT FROM DOCS/")
    print("="*70 + "\n")

    book_parts = []

    # Add intro if exists
    intro_path = DOCS_DIR / "intro.md"
    if intro_path.exists():
        print("[*] Reading: intro.md")
        with open(intro_path, 'r', encoding='utf-8') as f:
            intro_content = f.read()
        intro_content = clean_markdown_frontmatter(intro_content)
        if intro_content:
            book_parts.append(intro_content)
            book_parts.append("\n\n" + "="*70 + "\n\n")

    # Add all chapters in order
    for idx, chapter in enumerate(CHAPTERS, 1):
        chapter_content = extract_chapter_content(chapter)

        if chapter_content:
            # Add chapter separator
            separator = f"\n\n{'='*70}\n"
            separator += f"CHAPTER {idx}\n"
            separator += f"{'='*70}\n\n"

            book_parts.append(separator)
            book_parts.append(chapter_content)

    combined_content = "".join(book_parts)

    print(f"\n[OK] Combined {len(CHAPTERS)} chapters")
    print(f"[*] Total content length: {len(combined_content):,} characters")
    print(f"[*] Total word count: ~{len(combined_content.split()):,} words")

    return combined_content


def backup_old_book():
    """Create backup of old (wrong) book.txt"""
    if BOOK_TXT_PATH.exists():
        backup_path = BOOK_TXT_PATH.with_suffix('.txt.backup')
        print(f"\n[*] Creating backup: {backup_path.name}")

        with open(BOOK_TXT_PATH, 'r', encoding='utf-8') as f:
            old_content = f.read()

        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(old_content)

        print(f"[OK] Backup created ({len(old_content):,} chars)")
    else:
        print(f"[!] No existing book.txt found at {BOOK_TXT_PATH}")


def write_new_book(content: str):
    """Write new correct content to book.txt"""
    print(f"\n[*] Writing new book.txt to: {BOOK_TXT_PATH}")

    with open(BOOK_TXT_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] New book.txt written ({len(content):,} characters)")


def run_ingestion():
    """Run ingest.py to update Qdrant vector database"""
    print("\n" + "="*70)
    print("RUNNING INGESTION TO UPDATE QDRANT")
    print("="*70 + "\n")

    if not INGEST_SCRIPT.exists():
        print(f"[ERROR] {INGEST_SCRIPT} not found!")
        return False

    try:
        # Change to backend directory
        os.chdir(PROJECT_ROOT / "backend")

        # Run ingest.py
        print(f"[*] Executing: python ingest.py")
        result = subprocess.run(
            ["python", "ingest.py"],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        print(result.stdout)

        if result.returncode != 0:
            print(f"[ERROR] Ingestion failed with code {result.returncode}")
            print(result.stderr)
            return False

        print("\n[OK] Ingestion completed successfully!")
        return True

    except subprocess.TimeoutExpired:
        print("[ERROR] Ingestion timed out after 5 minutes")
        return False
    except Exception as e:
        print(f"[ERROR] Error running ingestion: {e}")
        return False
    finally:
        os.chdir(PROJECT_ROOT)


def verify_update():
    """Verify the book.txt update was successful"""
    print("\n" + "="*70)
    print("VERIFICATION")
    print("="*70 + "\n")

    with open(BOOK_TXT_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check for CORRECT content markers
    correct_markers = [
        "Physical AI",
        "ROS 2",
        "Digital Twin",
        "NVIDIA Isaac",
        "Vision-Language-Action",
        "VLA Models"
    ]

    # Check for WRONG content markers (should NOT be present)
    wrong_markers = [
        "Denavit-Hartenberg",
        "Zero Moment Point",
        "Kinematics and Motion Planning",
        "Forward and Inverse Kinematics"
    ]

    print("[OK] Checking for CORRECT content markers:")
    found_correct = 0
    for marker in correct_markers:
        if marker in content:
            print(f"   [+] Found: '{marker}'")
            found_correct += 1
        else:
            print(f"   [-] Missing: '{marker}'")

    print(f"\n[!] Checking for WRONG content markers (should be absent):")
    found_wrong = 0
    for marker in wrong_markers:
        if marker in content:
            print(f"   [-] STILL PRESENT: '{marker}' (BAD!)")
            found_wrong += 1
        else:
            print(f"   [+] Removed: '{marker}'")

    print("\n" + "="*70)
    if found_correct >= 4 and found_wrong == 0:
        print("[OK] VERIFICATION PASSED - Knowledge base successfully updated!")
    else:
        print("[!] VERIFICATION INCOMPLETE - Manual check recommended")
    print("="*70)

    return found_correct >= 4 and found_wrong == 0


def main():
    """Main execution function"""
    print("\n" + "="*70)
    print("KNOWLEDGE BASE FIX SCRIPT")
    print("="*70)
    print("\nProblem: backend/book.txt contains WRONG 'Humanoid Robotics' content")
    print("Solution: Replace with CORRECT 'Physical AI' content from docs/\n")

    # Step 1: Build correct book content
    try:
        book_content = build_book_content()

        if not book_content:
            print("[ERROR] No content extracted from docs/")
            return 1

        # Step 2: Backup old book
        backup_old_book()

        # Step 3: Write new book
        write_new_book(book_content)

        # Step 4: Run ingestion
        ingestion_success = run_ingestion()

        if not ingestion_success:
            print("\n[!] WARNING: Ingestion failed but book.txt was updated")
            print("You may need to run 'python backend/ingest.py' manually")

        # Step 5: Verify
        verify_update()

        print("\n" + "="*70)
        print("KNOWLEDGE BASE FIX COMPLETE!")
        print("="*70)
        print("\nNext Steps:")
        print("1. Test chatbot with: 'What is ROS 2?'")
        print("2. Test chatbot with: 'Explain Digital Twin simulation'")
        print("3. Test chatbot with: 'What are VLA models?'")
        print("\nChatbot should now answer these questions correctly!")

        return 0

    except Exception as e:
        print(f"\n[FATAL ERROR] {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
