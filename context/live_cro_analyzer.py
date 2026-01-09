import sys
import os
import re
import json
import time
from datetime import datetime
from urllib.parse import urlparse
from collections import defaultdict

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ComprehensiveCROAuditor:
    """Granular per-item CRO audit using ChatGPT for maximum quality."""
    
    def __init__(self, url):
        self.url = url if url.startswith('http') else f'https://{url}'
        self.soup = None
        self.text_content = ""
        self.title = ""
        self.h1 = ""
        self.h2 = ""
        self.hero_paragraphs = []
        self.ctas = []
        self.testimonials = []
        self.all_headings = []
        self.report = defaultdict(list)
        self.api_calls_made = 0
        
        # Configure OpenAI
        api_key = os.environ.get('OPENAI_API_KEY', '')
        if api_key:
            self.client = OpenAI(api_key=api_key)
            self.model = "gpt-4o-mini"
        else:
            print("⚠️ OPENAI_API_KEY not found.")
            self.client = None
        

    
    def run_audit(self):
        print(f"\n🤖 COMPREHENSIVE CRO AUDIT (Granular Analysis)\n📍 URL: {self.url}\n")
        
        # Fetch content
        try:
            self._fetch_content()
        except Exception as e:
            print(f"❌ Error: {e}")
            return
        
        print(f"\n📋 Analyzing ~40 framework items (this will take 2-3 minutes)...\n")
        
        # Run ALL audit items (granular)
        self._audit_all_items()
        
        # Save reports
        self._save_reports()
        print(f"\n✅ Complete! Made {self.api_calls_made} ChatGPT API calls for maximum quality.\n")
    

    
    def _fetch_content(self):
        """Fetch page with Selenium."""
        print("🌍 Loading page...")
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--log-level=3')
        
        driver = None
        try:
            driver = webdriver.Chrome(options=options)
            driver.get(self.url)
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
            
            # Scroll to load lazy content
            total_height = int(driver.execute_script("return document.body.scrollHeight"))
            for i in range(1, total_height, 1000):
                driver.execute_script(f"window.scrollTo(0, {i});")
                time.sleep(0.05)
            time.sleep(1)
            
            self.soup = BeautifulSoup(driver.page_source, 'html.parser')
        finally:
            if driver:
                driver.quit()
        
        # Extract sections
        for script in self.soup(["script", "style", "noscript"]):
            script.extract()
        
        self.text_content = self.soup.get_text(separator=' ', strip=True)[:5000]
        self.title = self.soup.title.string if self.soup.title else "No Title"
        h1_tag = self.soup.find('h1')
        self.h1 = h1_tag.get_text(strip=True) if h1_tag else "No H1"
        h2_tag = self.soup.find('h2')
        self.h2 = h2_tag.get_text(strip=True) if h2_tag else ""
        
        paragraphs = [p.get_text(strip=True) for p in self.soup.find_all('p') if len(p.get_text(strip=True)) > 20]
        self.hero_paragraphs = paragraphs[:3]
        
        cta_buttons = self.soup.find_all(['a', 'button'], class_=re.compile(r'btn|button|cta', re.I))
        self.ctas = [btn.get_text(strip=True) for btn in cta_buttons if btn.get_text(strip=True)][:5]
        
        self.all_headings = [h.get_text(strip=True) for h in self.soup.find_all(['h1', 'h2', 'h3'])][:10]
        
        testimonial_containers = self.soup.find_all(class_=re.compile(r'testimon|review|quote', re.I))
        self.testimonials = [t.get_text(strip=True)[:200] for t in testimonial_containers][:3]
        
        print(f"✅ Content extracted\n")
    
    def _analyze_item(self, question, context, guidance):
        """Analyze a single framework item with ChatGPT."""
        if not self.client:
            return {"score": 0, "issues": ["API not available"], "suggestion": "Manual review"}
        
        prompt = f"""You are an expert conversion copywriter conducting a CRO audit.

**Question:** {question}

**Page Context:**
{context}

**Analysis Guidance:**
{guidance}

Provide your analysis as JSON:
{{
  "score": 0-3,
  "issues": ["specific issue 1", "specific issue 2"],
  "suggestion": "Concrete, actionable recommendation with example"
}}

Be harsh and specific. Provide real examples, not generic advice."""

        try:
            self.api_calls_made += 1
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert conversion copywriter. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content.strip())
            return {
                "score": result.get("score", 0),
                "issues": result.get("issues", []),
                "suggestion": result.get("suggestion", "")
            }
        except Exception as e:
            return {"score": 0, "issues": [f"Error: {str(e)}"], "suggestion": "Manual review"}
    
    def _audit_all_items(self):
        """Run comprehensive audit of all ~40 framework items."""
        
        # ===================================================================
        # 1. ORIENT UPON ENTRANCE (4 items)
        # ===================================================================
        print("🔍 1/7: Orient Upon Entrance...")
        cat = "1. Orient Upon Entrance"
        
        # 1.1
        result = self._analyze_item(
            "Does the header copy explain WHAT the product/service is?",
            f"H1: '{self.h1}'\nH2: '{self.h2}'\nFirst paragraph: '{self.hero_paragraphs[0] if self.hero_paragraphs else 'None'}'",
            "The H1 should immediately clarify the product category and function. Score 3 if crystal clear, 0 if vague."
        )
        self._add_item(cat, "Does header explain WHAT the product is?", result)
        
        # 1.2
        result = self._analyze_item(
            "Does the header copy match the pre-click ad or SERP copy?",
            f"Page Title: '{self.title}'\nH1: '{self.h1}'",
            "Check for message match/scent. Title is a proxy for ad copy. Strong overlap = 3, no overlap = 0."
        )
        self._add_item(cat, "Does header match ad/SERP expectations?", result)
        
        # 1.3
        result = self._analyze_item(
            "Does the copy clearly call out WHO the product/service is for?",
            f"H1: '{self.h1}'\nH2: '{self.h2}'\nHero: '{self.hero_paragraphs[0] if self.hero_paragraphs else ''}'",
            "Look for explicit audience targeting like 'for DevOps teams' or 'built for marketers'. Score 3 if specific, 0 if generic."
        )
        self._add_item(cat, "Does copy call out WHO it's for?", result)
        
        # 1.4 
        result = self._analyze_item(
            "Is there a clear, visually dominant page goal that leads into the funnel?",
            f"CTAs found: {', '.join(self.ctas) if self.ctas else 'None'}",
            "Evaluate if there's ONE primary action. Score 3 if clear dominant CTA, 0 if confusing/multiple equal CTAs."
        )
        self._add_item(cat, "Is there a clear page goal?", result)
        
        # ===================================================================
        # 2. APPEAL TO USER MOTIVATION (2 items)
        # ===================================================================
        print("🔍 2/7: Appeal to User Motivation...")
        cat = "2. Appeal to User Motivation"
        
        # 2.1
        hero_text = '\n'.join(self.hero_paragraphs[:2])
        result = self._analyze_item(
            "Does the copy focus on desired outcomes or pain elimination?",
            f"Hero copy:\n{hero_text}",
            "Look for pain (frustrations, risks) and gain (achievements, outcomes) language. Score 3 if strong focus, 0 if product-centric only."
        )
        self._add_item(cat, "Focus on pain/gain outcomes?", result)
        
        # 2.2
        result = self._analyze_item(
            "Are these desires/pain points described specifically and vividly?",
            f"Hero copy:\n{hero_text}\n\nAll headings: {', '.join(self.all_headings[:5])}",
            "Check for specific, quantified language vs generic ('save time' = bad, 'deploy in 60 seconds' = good). Score 3 if vivid, 0 if generic."
        )
        self._add_item(cat, "Specific and vivid language?", result)
        
        # ===================================================================
        # 3. CONVEY UNIQUE VALUE (4 items)
        # ===================================================================
        print("🔍 3/7: Convey Unique Value...")
        cat = "3. Convey Unique Value"
        
        # 3.1
        result = self._analyze_item(
            "Does the copy bridge product features to user desires?",
            f"Sample copy:\n{self.text_content[:1000]}",
            "Look for 'so that', 'which means', 'allowing you to' connectors. Score 3 if consistent bridges, 0 if feature-dump."
        )
        self._add_item(cat, "Feature-benefit bridges?", result)
        
        # 3.2
        result = self._analyze_item(
            "Does copy explain advantages over existing solutions?",
            f"Headings: {', '.join(self.all_headings[:10])}",
            "Look for competitive differentiation, comparisons, or 'unlike X' language. Score 3 if clear differentiation, 0 if generic."
        )
        self._add_item(cat, "Competitive advantages explained?", result)
        
        # 3.3
        result = self._analyze_item(
            "Does copy support claims with objective proof?",
            f"Sample copy:\n{self.text_content[:1000]}",
            "Look for stats, numbers, percentages, case study data. Score 3 if proof-heavy, 0 if unsubstantiated claims."
        )
        self._add_item(cat, "Claims backed by proof?", result)
        
        # 3.4
        result = self._analyze_item(
            "Does copy support claims with demonstrations/previews?",
            f"Found {len(self.soup.find_all(['video', 'iframe']))} videos, {len(self.soup.find_all('img'))} images",
            "Check if visual demos/screenshots exist. Score 3 if strong visual proof, 0 if text-only."
        )
        self._add_item(cat, "Visual demonstrations included?", result)
        
        # ===================================================================
        # 4. ESTABLISH CREDIBILITY (4 items)
        # ===================================================================
        print("🔍 4/7: Establish Credibility...")
        cat = "4. Establish Credibility"
        
        # 4.1
        testimonial_text = '\n---\n'.join(self.testimonials) if self.testimonials else "None found"
        result = self._analyze_item(
            "Does copy include customer endorsements from target market?",
            f"Testimonials:\n{testimonial_text}",
            "Check for customer quotes. Score 3 if multiple relevant testimonials, 0 if none."
        )
        self._add_item(cat, "Customer testimonials present?", result)
        
        # 4.2
        result = self._analyze_item(
            "Does copy include high-profile media endorsements?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Look for 'Featured in', 'As seen on', media logos. Score 3 if strong media presence, 0 if none."
        )
        self._add_item(cat, "Media endorsements?", result)
        
        # 4.3
        result = self._analyze_item(
            "Does copy include impressive popularity metrics?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Look for '10,000+ users', '5-star rated', large numbers. Score 3 if compelling metrics, 0 if no social proof numbers."
        )
        self._add_item(cat, "Popularity metrics shown?", result)
        
        # 4.4
        result = self._analyze_item(
            "Are testimonials easily verifiable?",
            f"Testimonials:\n{testimonial_text}",
            "Check for full names, job titles, companies, photos. Score 3 if fully attributed, 0 if anonymous."
        )
        self._add_item(cat, "Testimonials verifiable?", result)
        
        # ===================================================================
        # 5. ADDRESS OBJECTIONS/FEARS (2 items)
        # ===================================================================
        print("🔍 5/7: Address Objections/Fears...")
        cat = "5. Address Objections/Fears"
        
        # 5.1
        result = self._analyze_item(
            "Does copy offer guarantees or reassurances?",
            f"Sample copy:\n{self.text_content[:1000]}",
            "Look for money-back guarantees, free trials, 'cancel anytime', risk reversals. Score 3 if strong guarantees, 0 if none."
        )
        self._add_item(cat, "Guarantees/reassurances offered?", result)
        
        # 5.2
        result = self._analyze_item(
            "Does copy address conversion-critical questions?",
            f"Headings: {', '.join(self.all_headings)}",
            "Look for FAQ, 'How it works', answers to pricing/setup/time questions. Score 3 if comprehensive FAQ, 0 if glossed over."
        )
        self._add_item(cat, "Critical questions addressed?", result)
        
        # ===================================================================
        # 6. PRESENT THE OFFER (5 items)
        # ===================================================================
        print("🔍 6/7: Present the Offer...")
        cat = "6. Present the Offer"
        
        cta_text = ', '.join(self.ctas) if self.ctas else "No CTAs found"
        
        # 6.1
        result = self._analyze_item(
            "Does CTA focus on acquiring value vs mechanical action?",
            f"CTAs: {cta_text}",
            "Good: 'Get Your Free Audit', 'Start Testing'. Bad: 'Submit', 'Click Here'. Score 3 if value-focused, 0 if mechanical."
        )
        self._add_item(cat, "CTA focuses on value?", result)
        
        # 6.2
        result = self._analyze_item(
            "Is the CTA the most visually dominant element?",
            f"CTAs: {cta_text}\nNote: Check visual hierarchy manually if scoring low.",
            "Score 3 if CTA stands out clearly, 0 if buried/small."
        )
        self._add_item(cat, "CTA visually dominant?", result)
        
        # 6.3
        result = self._analyze_item(
            "Does CTA make clear what user gets upon converting?",
            f"CTAs: {cta_text}",
            "Should be obvious what happens after clicking. Score 3 if crystal clear, 0 if ambiguous."
        )
        self._add_item(cat, "CTA outcome clear?", result)
        
        # 6.4
        result = self._analyze_item(
            "Does offer maximize value and minimize cost perception?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Look for 'free', 'no credit card', value stacking, cost anchoring. Score 3 if optimized, 0 if value unclear."
        )
        self._add_item(cat, "Value maximized, cost minimized?", result)
        
        # 6.5
        result = self._analyze_item(
            "Does offer include time-sensitive incentives?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Look for urgency: limited-time, countdown, scarcity. Score 3 if strong urgency, 0 if none."
        )
        self._add_item(cat, "Urgency/scarcity present?", result)
        
        # ===================================================================
        # 7. FORM DESIGN (9 items) - if forms exist
        # ===================================================================
        print("🔍 7/7: Form Design...")
        cat = "7. Form Design"
        
        forms = self.soup.find_all('form')
        if forms:
            form_html = str(forms[0])[:500]
            inputs = forms[0].find_all('input')
            
            # 7.1
            result = self._analyze_item(
                "Does form ask for minimum required information?",
                f"Form has {len(inputs)} input fields",
                "Fewer fields = higher conversion. Score 3 if ≤3 fields, 1 if 4-6, 0 if >6."
            )
            self._add_item(cat, "Minimum fields?", result)
            
            # 7.2-7.9 (simplified for brevity - would analyze each individually)
            self._add_item(cat, "Single-column layout?", {"score": 0, "issues": ["Manual visual check required"], "suggestion": "Use single-column vertical layout for mobile."})
            self._add_item(cat, "Labels visible (not placeholders)?", {"score": 0, "issues": ["Manual check required"], "suggestion": "Place labels above fields, don't rely on placeholders."})
            self._add_item(cat, "Input types optimized?", {"score": 0, "issues": ["Manual check"], "suggestion": "Use type='email' for email, type='tel' for phone, etc."})
            self._add_item(cat, "Error messages clear?", {"score": 0, "issues": ["Manual check"], "suggestion": "Show inline errors: 'Enter a valid email address'."})
            self._add_item(cat, "Form preserves data on error?", {"score": 0, "issues": ["Requires testing"], "suggestion": "Don't clear form on submit error."})
            self._add_item(cat, "Trust icons present?", {"score": 0, "issues": ["Manual check"], "suggestion": "Add 'Secure checkout' or SSL badges."})
            self._add_item(cat, "Help available if issues?", {"score": 0, "issues": ["Manual check"], "suggestion": "Add 'Need help?' link with chat/phone."})
            self._add_item(cat, "Confidence copy near form?", {"score": 0, "issues": ["Manual check"], "suggestion": "Add testimonial or 'Join 10k users' above form."})
        else:
            self._add_item(cat, "No form detected", {"score": 0, "issues": ["No forms found on page"], "suggestion": "N/A"})
        
        # ===================================================================
        # 8. SALES PAGE EDITING CHECKLIST
        # ===================================================================
        print("🔍 8/8: Sales Page Editing Checklist...")
        
        # -------------------------------------------------------------------
        # 8.1 CLARITY AND OFFER (2 items)
        # -------------------------------------------------------------------
        cat = "8. Sales Page Editing Checklist - Clarity"
        
        result = self._analyze_item(
            "Is the offer and its purpose stated with maximum clarity?",
            f"H1: '{self.h1}'\nH2: '{self.h2}'\nFirst paragraph: '{self.hero_paragraphs[0] if self.hero_paragraphs else ''}'",
            "Score 3 if the offer is crystal clear within 3 seconds of landing. Score 0 if visitor must search to understand what's being offered."
        )
        self._add_item(cat, "Offer clarity?", result)
        
        result = self._analyze_item(
            "Is the value proposition immediately obvious?",
            f"H1: '{self.h1}'\nH2: '{self.h2}'",
            "The main benefit should jump out. Score 3 if value is obvious without reading body copy, 0 if buried."
        )
        self._add_item(cat, "Value prop obvious?", result)
        
        # -------------------------------------------------------------------
        # 8.2 AUDIENCE AND MESSAGING ALIGNMENT (2 items)
        # -------------------------------------------------------------------
        cat = "8. Sales Page Editing Checklist - Messaging"
        
        result = self._analyze_item(
            "Is hero copy consistent with ad/SERP entry points?",
            f"Page Title: '{self.title}'\nH1: '{self.h1}'",
            "Message match is critical. Score 3 if title/H1 align perfectly (ad scent), 0 if mismatch creates confusion."
        )
        self._add_item(cat, "Ad scent match?", result)
        
        result = self._analyze_item(
            "Does copy reflect reader's motivations and pain points?",
            f"Hero copy:\n{chr(10).join(self.hero_paragraphs[:2])}",
            "Copy should speak to reader's world, not yours. Score 3 if empathetic and motivation-focused, 0 if company-centric."
        )
        self._add_item(cat, "Reader motivation reflected?", result)
        
        # -------------------------------------------------------------------
        # 8.3 VALUE AND PERSUASION (3 items)
        # -------------------------------------------------------------------
        cat = "8. Sales Page Editing Checklist - Persuasion"
        
        result = self._analyze_item(
            "Does page convey overwhelming value and opportunity?",
            f"Sample copy:\n{self.text_content[:1000]}",
            "Value stacking is key. Score 3 if benefits are abundant and compelling, 0 if value is unclear or weak."
        )
        self._add_item(cat, "Overwhelming value?", result)
        
        result = self._analyze_item(
            "Does copy answer 'So what?' and 'Prove it?' for skeptics?",
            f"Sample copy:\n{self.text_content[:1000]}",
            "Every claim needs proof and benefit clarity. Score 3 if skeptic-proof with evidence, 0 if unsubstantiated claims."
        )
        self._add_item(cat, "'So what?' and 'Prove it?' answered?", result)
        
        result = self._analyze_item(
            "Are claims substantiated with evidence?",
            f"Sample copy:\n{self.text_content[:1000]}\nTestimonials: {len(self.testimonials)}",
            "Look for testimonials, data, case studies. Score 3 if evidence-rich, 0 if claims without proof."
        )
        self._add_item(cat, "Claims have evidence?", result)
        
        # -------------------------------------------------------------------
        # 8.4 CONTENT AND ENGAGEMENT (4 items)
        # -------------------------------------------------------------------
        cat = "8. Sales Page Editing Checklist - Engagement"
        
        result = self._analyze_item(
            "Have generic descriptions been replaced with vivid 'word pictures'?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Vivid language creates mental images. Score 3 if copy paints pictures ('deploy in 60 seconds'), 0 if abstract/boring ('fast deployment')."
        )
        self._add_item(cat, "Vivid word pictures?", result)
        
        result = self._analyze_item(
            "Does copy guide attention to key visual elements?",
            f"Sample copy:\n{self.text_content[:600]}",
            "Look for directive language like 'notice the screenshot above', 'see how'. Score 3 if copy directs eyes, 0 if disconnected from visuals."
        )
        self._add_item(cat, "Guides attention to visuals?", result)
        
        result = self._analyze_item(
            "Do imagery and video directly support the copy's message?",
            f"Found {len(self.soup.find_all(['video', 'iframe']))} videos, {len(self.soup.find_all('img'))} images",
            "Visuals should enhance, not decorate. Score 3 if visuals prove claims/show product, 0 if generic stock photos."
        )
        self._add_item(cat, "Visuals support message?", result)
        
        result = self._analyze_item(
            "Does content include authentic, memorable details?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Specificity builds trust. Score 3 if specific names/numbers/stories ('Sarah at TechCorp saved 40 hours'), 0 if generic."
        )
        self._add_item(cat, "Authentic details?", result)
        
        # -------------------------------------------------------------------
        # 8.5 CONTENT PRUNING AND FOCUS (6 items)
        # -------------------------------------------------------------------
        cat = "8. Sales Page Editing Checklist - Pruning"
        
        # Count long paragraphs
        long_paras = [p for p in self.soup.find_all('p') if len(p.get_text().split()) > 50]
        result = self._analyze_item(
            "Has all non-essential content been removed?",
            f"Found {len(long_paras)} paragraphs over 50 words",
            "Every word must earn its place. Score 3 if lean and focused, 0 if bloated with fluff."
        )
        self._add_item(cat, "Non-essential removed?", result)
        
        # Nested purpose checks
        result = self._analyze_item(
            "Does every element reflect reader's motivation?",
            f"Headings:\n{chr(10).join(self.all_headings[:8])}",
            "Each section should address a desire or pain. Score 3 if motivation-centric throughout, 0 if product-centric."
        )
        self._add_item(cat, "Elements reflect motivation?", result)
        
        result = self._analyze_item(
            "Does every element convey/clarify value?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Features need benefit bridges. Score 3 if value is clear everywhere, 0 if feature-dumping without benefits."
        )
        self._add_item(cat, "Elements clarify value?", result)
        
        result = self._analyze_item(
            "Does every element prove a claim?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Claims need proof. Score 3 if every claim backed by evidence, 0 if unsubstantiated assertions."
        )
        self._add_item(cat, "Elements prove claims?", result)
        
        result = self._analyze_item(
            "Does every element address anxiety/objection?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Anticipate concerns. Score 3 if objections are pre-answered (FAQ, guarantees), 0 if ignored."
        )
        self._add_item(cat, "Addresses objections?", result)
        
        result = self._analyze_item(
            "Does every element add authenticity/specificity?",
            f"Sample copy:\n{self.text_content[:800]}",
            "Generic kills trust. Score 3 if specific throughout ('1,247 teams', real names), 0 if vague ('many customers')."
        )
        self._add_item(cat, "Authentic specificity?", result)
        
        # ===================================================================
        # 9. FEATURE-PAIN EXTRACTION & ANALYSIS
        # ===================================================================
        print(f"🔍 9/9: Extracting Features & Pain Points...")
        cat = "9. Feature-Pain Point Analysis"
        
        # Use ChatGPT to extract features and pain points from the page
        extraction_prompt = f"""Analyze this landing page and extract the product features and associated pain points.

**Page Content:**
Title: {self.title}
H1: {self.h1}
H2: {self.h2}
Hero: {self.hero_paragraphs[0] if self.hero_paragraphs else ''}
Headings: {', '.join(self.all_headings[:10])}
Sample Copy:
{self.text_content[:2000]}

**Task:** Identify up to 5 key product features mentioned on this page and their associated pain points.

For each feature, provide:
1. **Feature name** (e.g., "AI-Powered Test Generation")
2. **Is it unique?** (yes/no - does it differentiate from competitors?)
3. **Associated pain point** (what problem does it solve?)
4. **Severity** (1-5: how painful is this problem?)
5. **Frequency** (1-5: how often do users face this?)
6. **Desirable outcome** (what result does the user want?)

Return as JSON:
{{
  "features": [
    {{
      "feature": "Feature name",
      "unique": true/false,
      "pain_point": "Specific pain point",
      "severity": 1-5,
      "frequency": 1-5,
      "outcome": "Desired result"
    }}
  ]
}}

Be specific and base your analysis on actual page content."""

        if self.client:
            try:
                self.api_calls_made += 1
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert product analyst. Return valid JSON only."},
                        {"role": "user", "content": extraction_prompt}
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                
                extracted = json.loads(response.choices[0].message.content.strip())
                features = extracted.get("features", [])
                
                if features:
                    # Add each extracted feature as a finding
                    for f in features:
                        score = f.get('severity', 0) * f.get('frequency', 0)
                        unique_marker = " [UNIQUE]" if f.get('unique', False) else ""
                        
                        self._add_item(
                            cat,
                            f"{f.get('feature', 'Unknown')}{unique_marker}",
                            {
                                "score": min(score // 5, 3),  # Normalize to 0-3 scale
                                "issues": [
                                    f"Pain: {f.get('pain_point', 'N/A')}",
                                    f"Severity: {f.get('severity', 0)}/5, Frequency: {f.get('frequency', 0)}/5, Total Score: {score}"
                                ],
                                "suggestion": f"Desired Outcome: {f.get('outcome', 'N/A')}"
                            }
                        )
                else:
                    self._add_item(cat, "No features extracted", {
                        "score": 0,
                        "issues": ["Unable to identify clear product features from page content"],
                        "suggestion": "Make features more prominent and explicit on the page"
                    })
            except Exception as e:
                self._add_item(cat, "Extraction error", {
                    "score": 0,
                    "issues": [f"Error: {str(e)}"],
                    "suggestion": "Manual feature-pain analysis needed"
                })
        else:
            self._add_item(cat, "API unavailable", {
                "score": 0,
                "issues": ["OpenAI API not configured"],
                "suggestion": "N/A"
            })
        
        # ===================================================================
        # 10. HEADLINE COPY ANALYSIS
        # ===================================================================
        print(f"🔍 10/10: Headline Copy Analysis...")
        cat = "10. Headline Copy Quality"
        
        headline_prompt = f"""Analyze this landing page's headline and subheadline copy quality.

**H1:** "{self.h1}"
**H2:** "{self.h2}"

Evaluate across these 5 dimensions (score each 1-10):

1. **Specificity**: Does it use concrete, specific language vs vague generalities?
   - 10 = Very specific with numbers/details ("Reduce testing time by 50%")
   - 1 = Completely generic ("Better results")

2. **Uniqueness**: Does it differentiate from competitors?
   - 10 = Clearly unique positioning
   - 1 = Could apply to any competitor

3. **Desire**: Does it tap into deep motivations/outcomes?
   - 10 = Connects to core desires (speed, freedom, success)
   - 1 = Feature-focused, no emotional appeal

4. **Clarity**: Is it immediately understandable?
   - 10 = Crystal clear in 3 seconds
   - 1 = Confusing or requires thought

5. **Succinctness**: Is it concise without wasted words?
   - 10 = Every word necessary
   - 1 = Bloated, could cut 50%+

Return JSON:
{{
  "dimensions": [
    {{
      "name": "Specificity",
      "score": 1-10,
      "analysis": "Why this score",
      "suggestion": "Specific rewrite example"
    }},
    {{
      "name": "Uniqueness",
      "score": 1-10,
      "analysis": "Why this score",
      "suggestion": "Specific rewrite example"
    }},
    {{
      "name": "Desire",
      "score": 1-10,
      "analysis": "Why this score",
      "suggestion": "Specific rewrite example"
    }},
    {{
      "name": "Clarity",
      "score": 1-10,
      "analysis": "Why this score",
      "suggestion": "Specific rewrite example"
    }},
    {{
      "name": "Succinctness",
      "score": 1-10,
      "analysis": "Why this score",
      "suggestion": "Specific rewrite example"
    }}
  ]
}}"""

        if self.client:
            try:
                self.api_calls_made += 1
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert headline copywriter. Return valid JSON only."},
                        {"role": "user", "content": headline_prompt}
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                
                headline_analysis = json.loads(response.choices[0].message.content.strip())
                dimensions = headline_analysis.get("dimensions", [])
                
                if dimensions:
                    for dim in dimensions:
                        self._add_item(
                            cat,
                            f"{dim.get('name', 'Unknown')}",
                            {
                                "score": dim.get('score', 0),
                                "issues": [dim.get('analysis', 'N/A')],
                                "suggestion": dim.get('suggestion', 'N/A')
                            }
                        )
                else:
                    self._add_item(cat, "Analysis unavailable", {
                        "score": 0,
                        "issues": ["Unable to analyze headline"],
                        "suggestion": "Manual review needed"
                    })
            except Exception as e:
                self._add_item(cat, "Analysis error", {
                    "score": 0,
                    "issues": [f"Error: {str(e)}"],
                    "suggestion": "Manual headline review needed"
                })
        else:
            self._add_item(cat, "API unavailable", {
                "score": 0,
                "issues": ["OpenAI API not configured"],
                "suggestion": "N/A"
            })
    
    def _add_item(self, category, question, result):
        """Add audit result to report."""
        self.report[category].append({
            "question": question,
            "score": result['score'],
            "details": f"{'. '.join(result['issues'])}",
            "solution": result['suggestion']
        })
    
    def _save_reports(self):
        """Save MD and HTML reports."""
        if not os.path.exists("audits"):
            os.makedirs("audits")
        
        domain = urlparse(self.url).netloc.replace('www.', '').replace('.', '_')
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        base = f"audits/CRO_COMPREHENSIVE_{domain}_{ts}"
        
        # Markdown
        md = self._generate_markdown()
        with open(f"{base}.md", 'w', encoding='utf-8') as f:
            f.write(md)
        print(f"📝 {base}.md")
        
        # HTML
        html = self._generate_html(ts)
        with open(f"{base}.html", 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"🌍 {base}.html")
    
    def _generate_markdown(self):
        """Generate markdown report."""
        md = f"# 🤖 COMPREHENSIVE CRO AUDIT\n\n**URL:** {self.url}\n**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n**Analysis Depth:** Granular per-item (~40 AI calls)\n\n"
        
        for cat, items in self.report.items():
            md += f"## {cat}\n\n"
            is_headline = "Headline" in cat
            denominator = 10 if is_headline else 3
            
            for item in items:
                score = item['score']
                # Determine icon based on scale
                if is_headline:
                    icon = "🟢" if score >= 7 else ("🟡" if score >= 4 else "🔴")
                else:
                    icon = "🟢" if score >= 2 else ("🟡" if score == 1 else "🔴")
                
                md += f"### {icon} {item['question']}\n"
                md += f"- **Score:** {score}/{denominator}\n"
                md += f"- **Analysis:** {item['details']}\n"
                md += f"- **💡 Fix:** {item['solution']}\n\n"
            md += "---\n\n"
        
        md += f"**Scoring:** 🔴 0=Critical | 🟡 1=Needs Work | 🟢 2+=Good\n*Powered by AI - {self.api_calls_made} API calls*"
        return md
    
    def _generate_html(self, timestamp):
        """Generate HTML report."""
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>CRO Audit: {self.url}</title>
    <style>
        body {{ font-family: -apple-system, sans-serif; margin: 40px; background: #f5f5f5; }}
        .container {{ max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }}
        h1 {{ color: #1a73e8; }}
        .meta {{ color: #666; margin-bottom: 30px; }}
        .category {{ margin-bottom: 30px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }}
        .category-header {{ background: #f1f3f4; padding: 15px; font-weight: 600; text-transform: uppercase; }}
        .item {{ padding: 20px; border-bottom: 1px solid #eee; }}
        .item:last-child {{ border-bottom: none; }}
        .score {{ font-weight: bold; margin-bottom: 10px; }}
        .score.high {{ color: #0f9d58; }}
        .score.med {{ color: #f4b400; }}
        .score.low {{ color: #d93025; }}
        .fix {{ background: #e8f0fe; padding: 15px; border-radius: 4px; margin-top: 10px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Comprehensive CRO Audit</h1>
        <div class="meta">
            URL: <a href="{self.url}">{self.url}</a><br>
            Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}<br>
            Analysis: Granular per-item (~40 AI calls)
        </div>
"""
        
        for cat, items in self.report.items():
            html += f'<div class="category"><div class="category-header">{cat}</div>'
            is_headline = "Headline" in cat
            denominator = 10 if is_headline else 3
            
            for item in items:
                score = item['score']
                # Determine score class
                if is_headline:
                    score_class = "high" if score >= 7 else ("med" if score >= 4 else "low")
                else:
                    score_class = "high" if score >= 2 else ("med" if score == 1 else "low")
                
                html += f"""
                <div class="item">
                    <h3>{item['question']}</h3>
                    <div class="score {score_class}">Score: {score}/{denominator}</div>
                    <p><strong>Analysis:</strong> {item['details']}</p>
                    <div class="fix"><strong>💡 Fix:</strong> {item['solution']}</div>
                </div>"""
            html += "</div>"
            
        html += f"""
        <div class="meta" style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            Powered by AI - {self.api_calls_made} API calls
        </div>
    </div>
</body>
</html>"""
        return html

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else input("Enter URL: ")
    auditor = ComprehensiveCROAuditor(url)
    auditor.run_audit()
