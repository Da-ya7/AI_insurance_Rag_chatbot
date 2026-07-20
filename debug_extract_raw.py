from app.services.pdf_loader import extract_text_by_page

pages = extract_text_by_page("data/insurance_pdfs/Insurance_Basics_FAQ.pdf")
print(f"Total pages extracted: {len(pages)}\n")
for p in pages:
    print(f"--- page {p['page']} ({len(p['text'])} chars) ---")
    print(p["text"])
    print()