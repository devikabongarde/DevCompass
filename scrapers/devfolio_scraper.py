import json
import time
from playwright.sync_api import sync_playwright

def scrape_hackathons():
    results = []

    with sync_playwright() as p:
        # Launch browser (headless=False lets you see the process and solve CAPTCHAs)
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()

        # --- 1. HACKEREARTH ---
        print("🌍 Navigating to HackerEarth...")
        try:
            page.goto("https://www.hackerearth.com/challenges/hackathon/", timeout=60000)
            
            print("   Waiting for content...")
            # Wait for the cards to load
            page.wait_for_selector(".challenge-card-wrapper", timeout=20000)
            
            # Scroll down to ensure lazy-loaded elements appear
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(3) 

            # Extract data via JavaScript
            he_data = page.evaluate("""() => {
                const hacks = [];
                document.querySelectorAll('.challenge-card-wrapper').forEach(card => {
                    const titleEl = card.querySelector('.challenge-list-title');
                    const linkEl = card.querySelector('a.challenge-card-link');
                    
                    // Try to find the date text (it varies in class name)
                    const dateEl = card.querySelector('.date') || card.querySelector('.event-details');

                    if (titleEl && linkEl) {
                        hacks.push({
                            platform: 'HackerEarth',
                            title: titleEl.innerText.trim(),
                            link: linkEl.href,
                            date: dateEl ? dateEl.innerText.trim().replace(/\\n/g, ' ') : 'See Website'
                        });
                    }
                });
                return hacks;
            }""")
            
            print(f"   ✅ Found {len(he_data)} hackathons on HackerEarth.")
            results.extend(he_data)

        except Exception as e:
            print(f"   ❌ HackerEarth Error: {e}")

        # --- 2. DEVFOLIO ---
        print("\n🦄 Navigating to Devfolio...")
        try:
            page.goto("https://devfolio.co/hackathons", timeout=60000)
            
            # Wait for React to render the cards
            try:
                page.wait_for_selector('a[href*=".devfolio.co"]', timeout=15000)
            except:
                print("   Devfolio load timed out or no hackathons found.")

            # Scroll to load more
            page.mouse.wheel(0, 3000)
            time.sleep(3)

            dev_data = page.evaluate("""() => {
                const hacks = [];
                const links = Array.from(document.querySelectorAll('a[href*=".devfolio.co"]'));
                
                links.forEach(link => {
                    const titleEl = link.querySelector('h2') || link.querySelector('h3') || link.querySelector('span');
                    
                    // Filter out non-event links (like just 'devfolio.co')
                    if (titleEl && link.href.includes('devfolio.co') && !link.href.includes('discover')) {
                        hacks.push({
                            platform: 'Devfolio',
                            title: titleEl.innerText.trim(),
                            link: link.href,
                            date: 'See Website'
                        });
                    }
                });
                return hacks;
            }""")

            # Remove duplicates
            unique_dev = {v['link']: v for v in dev_data}.values()
            
            print(f"   ✅ Found {len(unique_dev)} hackathons on Devfolio.")
            results.extend(unique_dev)

        except Exception as e:
            print(f"   ❌ Devfolio Error: {e}")

        browser.close()
        return results

if __name__ == "__main__":
    print("--- STARTING SCRAPER ---")
    data = scrape_hackathons()
    
    # --- SAVE TO JSON FILE ---
    filename = "hackathons.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print("\n" + "="*50)
    print(f"DONE! Saved {len(data)} hackathons to '{filename}'")
    print("="*50)